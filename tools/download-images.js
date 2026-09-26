/**
 * 把外链图片下载到本地并改写为本地路径
 *
 * 背景：原站图片外链 raw.githubusercontent.com / gcore.jsdelivr.net，
 *       国内网络时常不可达。此脚本改走 jsDelivr 镜像抓取，落到 source/images/。
 *
 * 用法:  npm run images        只下载并改写
 *        npm run images -- -r  先还原成外链（撤销改写），再重新执行
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const POSTS = path.join(ROOT, 'source/_posts');
const IMG_DIR = path.join(ROOT, 'source/images');

// 原始外链 → jsDelivr 镜像
const MIRRORS = [
  { from: /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\//,
    to: (m) => `https://cdn.jsdelivr.net/gh/${m[1]}/${m[2]}@${m[3]}/` },
  { from: /^https:\/\/gcore\.jsdelivr\.net\/gh\/([^@/]+)\/([^/@]+)(@[^/]+)?\//,
    to: (m) => `https://cdn.jsdelivr.net/gh/${m[1]}/${m[2]}${m[3] || '@master'}/` },
];

// 外链 → 本地站内路径
function toLocal(url) {
  if (url.includes('raw.githubusercontent.com/kiyoriyuna/Image/main/'))
    return '/images/' + url.split('/main/')[1];
  if (url.includes('gcore.jsdelivr.net/gh/volantis-x/cdn-org/'))
    return '/images/' + url.split('/cdn-org/')[1];
  if (url.includes('gcore.jsdelivr.net/gh/xaoxuu/assets@master/'))
    return '/images/' + url.split('assets@master/')[1];
  return null; // 其它外链（第三方库等）不处理
}

function toMirror(url) {
  for (const m of MIRRORS) {
    const hit = url.match(m.from);
    // hit[0] 是匹配到的前缀，剩下的文件路径必须拼回去
    if (hit) return m.to(hit) + url.slice(hit[0].length);
  }
  return url;
}

function fetch(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('too many redirects'));
    const req = https.get(url, {
      timeout: 30000,
      // 缺 UA 会让 CDN 回 200 + HTML 错误页，必须带正常浏览器 UA
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(fetch(res.headers.location, redirects + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        // 校验确实是图片，避免把 CDN 的 HTML 错误页存成图片
        if (!isImage(buf)) {
          return reject(new Error('返回的不是图片 (content-type=' + (res.headers['content-type'] || '?') + ', ' + buf.length + 'B)'));
        }
        resolve(buf);
      });
      res.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

/** 按魔数判断是否为图片 */
function isImage(buf) {
  if (buf.length < 4) return false;
  const h = buf.slice(0, 4).toString('hex');
  if (h.startsWith('ffd8ff')) return true;                       // jpeg
  if (h === '89504e47') return true;                             // png
  if (buf.slice(0, 3).toString() === 'GIF') return true;         // gif
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return true;
  if (buf.slice(0, 4).toString() === '\x00\x00\x01\x00') return true; // ico
  if (buf.slice(0, 5).toString() === '<svg ' || buf.slice(0, 4).toString() === '<?xm') return true;
  if (buf.slice(0, 4).toString().trim() === '<svg') return true;
  return false;
}

async function retry(url, times = 3) {
  let last;
  for (let i = 0; i < times; i++) {
    try { return await fetch(url); } catch (e) { last = e; await new Promise(r => setTimeout(r, 800 * (i + 1))); }
  }
  throw last;
}

// ── 收集所有外链 ────────────────────────────────────────
/** 由本地路径反推原始外链（用于已改写过的引用） */
function fromLocal(local) {
  // about 页那张图：远端扩展名是 .bmp（内容实为 JPEG），本地按真实格式存成 .jpg
  if (local === '/images/BlogImg202211261957203.jpg')
    return 'https://raw.githubusercontent.com/kiyoriyuna/Image/main/BlogImg202211261957203.bmp';
  if (/^\/images\/BlogImg\//.test(local))
    return 'https://raw.githubusercontent.com/kiyoriyuna/Image/main/' + local.slice('/images/'.length);
  if (/^\/images\/BlogImg\d+\./.test(local))
    return 'https://raw.githubusercontent.com/kiyoriyuna/Image/main/' + local.slice('/images/'.length);
  if (/^\/images\/blog\/Logo-NavBar@3x\.png$/.test(local))
    return 'https://gcore.jsdelivr.net/gh/volantis-x/cdn-org/blog/Logo-NavBar@3x.png';
  if (/^\/images\/favicon\/favicon\.ico$/.test(local))
    return 'https://gcore.jsdelivr.net/gh/xaoxuu/assets@master/favicon/favicon.ico';
  return null;
}

/** 所有含图片引用的文件：文章 + 独立页面 + 站点/主题配置 */
function imageBearingFiles() {
  const md = (dir) =>
    fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => path.join(dir, f)) : [];
  return [
    ...md(POSTS),          // source/_posts/*.md
    ...md(path.resolve(POSTS, '..')), // source/*.md（about/friends 等页面）
    path.join(ROOT, '_config.yml'),
    path.join(ROOT, '_config.volantis.yml'),
  ];
}

function collect() {
  const targets = new Map(); // 当前文件里的字符串 -> [文件]
  const files = imageBearingFiles();
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const txt = fs.readFileSync(f, 'utf8');
    // 1) 仍是外链的
    for (const m of txt.matchAll(/https?:\/\/[^\s)"'<>\]]+\.(?:jpg|jpeg|png|gif|webp|svg|ico|bmp)/gi)) {
      const url = m[0].replace(/[.,;]+$/, '');
      if (!targets.has(url)) targets.set(url, []);
      if (!targets.get(url).includes(f)) targets.get(url).push(f);
    }
    // 2) 已改写成本地路径的
    for (const m of txt.matchAll(/\/images\/[^\s)"'<>\]]+\.(?:jpg|jpeg|png|gif|webp|svg|ico|bmp)/gi)) {
      const local = m[0].replace(/[.,;]+$/, '');
      if (!fromLocal(local)) continue;
      if (!targets.has(local)) targets.set(local, []);
      if (!targets.get(local).includes(f)) targets.get(local).push(f);
    }
  }
  return targets;
}

// ── 撤销改写：把本地路径还原成原始外链 ──────────────────
function revert() {
  const files = imageBearingFiles();
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    let txt = fs.readFileSync(f, 'utf8');
    const before = txt;
    // 特例：about 页那张图本地是 .jpg，远端是 .bmp，必须先于通用规则匹配
    txt = txt.replace(/\/images\/BlogImg202211261957203\.jpg/g,
      'https://raw.githubusercontent.com/kiyoriyuna/Image/main/BlogImg202211261957203.bmp');
    txt = txt.replace(/\/images\/(BlogImg\/[^"' )<]+)/g,
      'https://raw.githubusercontent.com/kiyoriyuna/Image/main/$1');
    txt = txt.replace(/\/images\/(BlogImg\d+\.[a-z]+)/gi,
      'https://raw.githubusercontent.com/kiyoriyuna/Image/main/$1');
    txt = txt.replace(/\/images\/(Logo-NavBar@3x\.png)/g,
      'https://gcore.jsdelivr.net/gh/volantis-x/cdn-org/blog/$1');
    txt = txt.replace(/\/images\/(favicon\.ico)/g,
      'https://gcore.jsdelivr.net/gh/xaoxuu/assets@master/$1');
    if (txt !== before) { fs.writeFileSync(f, txt, 'utf8'); console.log('  还原', path.relative(ROOT, f)); }
  }
}

(async () => {
  if (process.argv.includes('-r') || process.argv.includes('--revert')) {
    console.log('还原外链…');
    revert();
    return;
  }

  const targets = collect();
  const jobs = [];
  for (const [cur, where] of targets) {
    const isLocal = cur.startsWith('/images/');
    const local = isLocal ? cur : toLocal(cur);
    if (!local) continue;
    const remote = isLocal ? fromLocal(cur) : cur;
    if (!remote) continue;
    jobs.push({ cur, remote, local, where });
  }

  console.log(`发现图片引用 ${targets.size} 个，需下载 ${jobs.length} 个\n`);
  fs.mkdirSync(IMG_DIR, { recursive: true });

  let ok = 0, fail = 0;
  const CONC = 6;
  let idx = 0;
  async function worker() {
    while (idx < jobs.length) {
      const j = jobs[idx++];
      const dest = path.join(ROOT, 'source', j.local.replace(/^\//, ''));
      try {
        // 已存在且确实是图片才跳过（防止上次存下的 HTML 错误页被当成成功）
        if (fs.existsSync(dest) && isImage(fs.readFileSync(dest))) {
          ok++; process.stdout.write('='); continue;
        }
        const buf = await retry(toMirror(j.remote));
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, buf);
        ok++; process.stdout.write('#');
      } catch (e) {
        fail++; console.log(`\n  ✗ ${j.remote.slice(0, 80)} -> ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));

  console.log(`\n\n下载完成: 成功 ${ok} / 失败 ${fail}`);

  // 改写引用（当前仍是指向别处时才替换）
  if (ok > 0) {
    let changed = 0;
    for (const j of jobs) {
      if (j.cur === j.local) continue;
      for (const f of j.where) {
        const txt = fs.readFileSync(f, 'utf8');
        if (txt.includes(j.cur)) {
          fs.writeFileSync(f, txt.split(j.cur).join(j.local), 'utf8');
          changed++;
        }
      }
    }
    console.log(`已改写 ${changed} 处引用为本地路径`);
  }
  console.log('\n如需撤销: npm run images -- -r');
})().catch(e => { console.error('失败:', e.message); process.exit(1); });
