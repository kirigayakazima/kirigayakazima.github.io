/**
 * 从旧站静态 HTML + content.json 重新迁移文章
 * - 正文：提取 <div id="post-body"> 的完整 HTML（标题/图片/公式/代码都保留）
 * - frontmatter：修正 categories/tags 的 [object Object]，并保留层级
 *
 * 数据源：
 *   - 元数据 content.json → 已归档在 tools/legacy/content.json（随仓库携带）
 *   - 文章正文 HTML        → 需要旧站静态文件，路径用 BLOG_SRC 指定
 *       BLOG_SRC=D:\CodePackage\Blog\kirigayakazima.github.io npm run migrate
 */
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '../source/_posts');

// 旧站静态文件目录（用于提取文章正文 HTML）
const SRC = process.env.BLOG_SRC
  ? path.resolve(process.env.BLOG_SRC)
  : path.resolve(__dirname, '../../kirigayakazima.github.io');

// content.json 优先用随仓库归档的副本
const ARCHIVED = path.join(__dirname, 'legacy/content.json');
const CONTENT = fs.existsSync(ARCHIVED) ? ARCHIVED : path.join(SRC, 'content.json');

if (!fs.existsSync(CONTENT)) {
  console.error('找不到 content.json：\n  已归档: ' + ARCHIVED + '\n  备选  : ' + CONTENT);
  process.exit(1);
}
if (!fs.existsSync(SRC)) {
  console.error('找不到旧站静态文件目录，无法提取文章正文：\n  ' + SRC + '\n请用 BLOG_SRC 指定，例如：\n  BLOG_SRC=../kirigayakazima.github.io npm run migrate');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(CONTENT, 'utf8'));
console.log('数据源: ' + path.relative(process.cwd(), CONTENT));
console.log('正文源: ' + SRC);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const yamlStr = (s) => JSON.stringify(String(s == null ? '' : s));

/** 平衡地取出 <div id="post-body" ...> 到对应闭合 </div> */
function extractBody(html) {
  const start = html.indexOf('<div id="post-body"');
  if (start < 0) return null;
  const tagEnd = html.indexOf('>', start);
  const re = /<div\b|<\/div>/g;
  re.lastIndex = tagEnd + 1;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return html.slice(tagEnd + 1, m.index);
  }
  return null;
}

/** 清理旧站 HTML 里多余、会影响新站渲染的标记 */
function cleanBody(html) {
  return html
    // 原站残留的空标题锚点（<a class="headerlink"></a>），无内容且无意义
    .replace(/<a\s+[^>]*class=["']headerlink["'][^>]*>\s*?<\/a>/g, '')
    // lazyload 占位 srcset 会让浏览器选中 1x1 透明图，必须去掉
    .replace(/\s+(?:data-srcset|srcset|data-src)=["'][^"']*["']/g, '')
    .replace(/\s+class=["']lazyload["']/g, '')
    // 零宽字符（空格/ZWNJ/ZWJ/词连接符/BOM/软连字符）会让搜索和对比失灵
    .replace(/[​‌‍⁠﻿­]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9一-龥]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** categories 的 slug 形如 "数字IC/数电"，拆成层级 */
function categoryTree(cats) {
  return (cats || [])
    .map((c) => String(c.slug || c.name).split('/').filter(Boolean))
    .filter((a) => a.length);
}

let ok = 0;
const missing = [];

for (const p of data.posts) {
  const file = path.join(SRC, p.path, 'index.html');
  let html;
  try {
    html = fs.readFileSync(file, 'utf8');
  } catch (e) {
    missing.push(p.path);
    continue;
  }
  const body = extractBody(html);
  if (!body) {
    missing.push(p.path + ' (no post-body)');
    continue;
  }

  const cats = categoryTree(p.categories);
  const tags = (p.tags || []).map((t) => t.name || String(t));

  let fm = '---\n';
  fm += `title: ${yamlStr(p.title)}\n`;
  fm += `date: ${p.date}\n`;
  if (p.updated) fm += `updated: ${p.updated}\n`;
  fm += `author: ${yamlStr(data.meta.author)}\n`;
  if (cats.length) {
    fm += 'categories:\n';
    for (const c of cats) {
      fm += `  - [${c.map(yamlStr).join(', ')}]\n`;
    }
  }
  if (tags.length) {
    fm += 'tags:\n';
    for (const t of tags) fm += `  - ${yamlStr(t)}\n`;
  }
  if (p.excerpt) fm += `description: ${yamlStr(String(p.excerpt).replace(/<[^>]+>/g, ''))}\n`;
  fm += '---\n\n';

  const name = (p.slug || slugify(p.title)) + '.md';
  fs.writeFileSync(path.join(OUT, name), fm + cleanBody(body) + '\n', 'utf8');
  ok++;
}

console.log(`迁移完成: ${ok}/${data.posts.length}`);
if (missing.length) console.log('缺失:', missing);

/* ---------- 页面 ---------- */
const PAGE_DIR = path.resolve(__dirname, '../source');
const today = new Date().toISOString().slice(0, 10);
const pages = [
  ['about', '关于', `
<div class="note quote"><p>欢迎你</p></div>

## 博客地址

- 主页：[https://kirigayakazima.github.io/](https://kirigayakazima.github.io/)
- 归档：[https://kirigayakazima.github.io/archives/](https://kirigayakazima.github.io/archives/)

## 关于我

我是 **玄儿 (xuaner)**，热爱技术的开发者。

- 嵌入式开发：FreeRTOS、STM32、51 单片机
- 数字 IC 设计：Verilog、静态时序分析、逻辑综合
- 数据结构与算法、C 语言

## 联系方式

- 博客主页：[kirigayakazima.github.io](https://kirigayakazima.github.io/)
- GitHub：[kirigayakazima](https://github.com/kirigayakazima)

## 关于博客

记录学习笔记与实践踩坑，使用 Hexo + Volantis 构建，部署在 GitHub Pages。
`],
  ['categories', '分类', ''],
  ['tags', '标签', ''],
  ['friends', '我的朋友们', ''],
];

for (const [slug, title, body] of pages) {
  const type = slug === 'about' ? undefined : slug;
  let fm = `---\ntitle: ${yamlStr(title)}\n`;
  fm += `permalink: ${slug}/index.html\n`;
  fm += `date: ${today}\n`;
  if (type) fm += `type: ${type}\n`;
  if (slug === 'friends') fm += 'layout: link\n';
  fm += '---\n\n';
  fs.writeFileSync(path.join(PAGE_DIR, slug + '.md'), fm + body, 'utf8');
}
console.log('页面已创建:', pages.map((p) => p[0]).join(', '));
