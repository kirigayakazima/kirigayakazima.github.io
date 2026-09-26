/**
 * 从旧站静态 HTML 反推 _config.volantis.yml
 * 以 Volantis 5.4.0 默认配置为底，只覆盖与旧站不同的键。
 *
 * 数据来源：
 *   - kirigayakazima.github.io/index.html      导航/cover/侧边栏/footer
 *   - .../index.html 内嵌 volantis.GLOBAL_CONFIG  sidebar/plugins/rightmenus
 */
const fs = require('fs');
const path = require('path');

const THEME = path.resolve(__dirname, '../node_modules/hexo-theme-volantis/_config.yml');
const OUT = path.resolve(__dirname, '../_config.volantis.yml');

const yaml = require('js-yaml');
const def = yaml.load(fs.readFileSync(THEME, 'utf8'));

// ── 导航栏（顶部固定栏） ────────────────────────────────
const MENU = [
  { name: '博客', icon: 'fa-solid fa-rss', url: '/' },
  { name: '分类', icon: 'fa-solid fa-folder-open', url: 'categories/' },
  { name: '标签', icon: 'fa-solid fa-tags', url: 'tags/' },
  { name: '归档', icon: 'fa-solid fa-archive', url: 'archives/' },
  { name: '友链', icon: 'fa-solid fa-link', url: 'friends/' },
  { name: '关于', icon: 'fa-solid fa-info-circle', url: 'about/' },
];

// ── 首屏 cover（搜索版式：标题 + 搜索框 + 文本菜单） ──────
const COVER_BG = 'https://raw.githubusercontent.com/kiyoriyuna/Image/main/BlogImg202211261959533.jpg';
const FEATURES = [
  { name: '文档', url: '/' },
  { name: '分类', url: 'categories/' },
  { name: '标签', url: 'tags/' },
  { name: '归档', url: 'archives/' },
  { name: '友链', url: 'friends/' },
  { name: '关于', url: 'about/' },
];

// ── 侧边栏 blogger 组件 ─────────────────────────────────
const AVATAR = 'https://raw.githubusercontent.com/kiyoriyuna/Image/main/BlogImg202211262024354.jpg';
const SOCIAL = [
  { icon: 'fa-solid fa-envelope', url: 'mailto:519033432@qq.com' },
  { icon: 'fab fa-github', url: 'https://github.com/kirigayakazima' },
  { icon: 'fa-solid fa-headphones-alt', url: 'https://music.163.com/#/user/home?id=551934240' },
];

const cfg = def;

cfg.navbar = {
  visiable: 'auto',
  logo: {
    img: 'https://gcore.jsdelivr.net/gh/volantis-x/cdn-org/blog/Logo-NavBar@3x.png',
    icon: null,
    title: null,
  },
  menu: MENU,
  search: '搜内容',
};

cfg.cover = {
  height_scheme: 'full',
  layout_scheme: 'search',
  display: { home: true, archive: true, others: false },
  background: COVER_BG,
  logo: null,
  title: '玄儿的小世界',
  subtitle: '',
  search: '搜内容',
  features: FEATURES,
};

cfg.sidebar = cfg.sidebar || {};
cfg.sidebar.position = 'right';
cfg.sidebar.for_page = ['blogger', 'category', 'tagcloud'];
cfg.sidebar.for_post = ['toc'];
cfg.sidebar.widget_library = cfg.sidebar.widget_library || {};
cfg.sidebar.widget_library.blogger = Object.assign({}, cfg.sidebar.widget_library.blogger, {
  avatar: AVATAR,
  shape: 'rectangle',
  url: '/about/',
  title: null,
  subtitle: null,
  jinrishici: true,
  social: SOCIAL,
});
// 建站日期 → webinfo runtime
cfg.sidebar.widget_library.webinfo = Object.assign({}, cfg.sidebar.widget_library.webinfo, {
  type: Object.assign({}, cfg.sidebar.widget_library.webinfo && cfg.sidebar.widget_library.webinfo.type, {
    runtime: Object.assign(
      {},
      cfg.sidebar.widget_library.webinfo && cfg.sidebar.widget_library.webinfo.type && cfg.sidebar.widget_library.webinfo.type.runtime,
      { enable: true, data: '2022/11/26', unit: '天' }
    ),
    lastupd: Object.assign(
      {},
      cfg.sidebar.widget_library.webinfo && cfg.sidebar.widget_library.webinfo.type && cfg.sidebar.widget_library.webinfo.type.lastupd,
      { enable: true, friendlyShow: true }
    ),
  }),
});

cfg.site_footer = Object.assign({}, cfg.site_footer, {
  // 旧站实际只输出这 4 项；主题默认还含 analytics(LeanCloud 访问统计) 和 info("本站使用 XX 作为主题")
  layout: ['aplayer', 'social', 'license', 'copyright'],
  social: SOCIAL,
  source: 'https://github.com/kirigayakazima/kirigayakazima.github.io/',
  // 原站为 "2023-  by"（两个空格）；按要求改为起止年份 2023-2026
  copyright: '[Copyright © 2023-2026 by清羽玄儿](/)',
});

cfg.search = { enable: true, service: 'hexo', js: null };

// ── 旧站开启、主题默认关闭的开关 ────────────────────────
// 这三个开关各自控制一批 stylus 的条件编译：
//   plugins.darkmode.enable  → [color-scheme='dark'] 全套暗黑样式
//   custom_css.cursor.enable → 自定义光标 .cur-* / fancybox 光标
//   plugins.aplayer.enable   → 音乐播放器 + 右键音乐控制
// 注意：aplayer 保持默认关闭 —— 旧站只用了文章内 aplayer 标签和右键音量条，
// 并未启用整套播放器（开启会多出 31 个 .aplayer 选择器，与原站不符）。
cfg.plugins = Object.assign({}, cfg.plugins, {
  darkmode: Object.assign({}, cfg.plugins && cfg.plugins.darkmode, { enable: true }),
});
cfg.custom_css = Object.assign({}, cfg.custom_css, {
  cursor: Object.assign({}, cfg.custom_css && cfg.custom_css.cursor, { enable: true }),
});

// 右键菜单：旧站精简为 导航 / 暗黑 / 文章操作 / 音乐
cfg.rightmenus = Object.assign({}, cfg.rightmenus, {
  enable: true,
  order: ['plugins.navigation', 'hr', 'menus.darkMode', 'plugins.articlePage', 'music'],
  options: Object.assign({}, cfg.rightmenus && cfg.rightmenus.options, {
    iconPrefix: 'fa-solid',
    articleShowLink: true,
    musicAlwaysShow: true,
  }),
});

// ── 输出（丢掉 null 占位，保持 YAML 干净） ──────────────
function clean(v) {
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) {
      const c = clean(v[k]);
      if (c !== null && c !== undefined) o[k] = c;
    }
    return o;
  }
  return v;
}

const header = [
  '# Volantis 主题配置 —— 由 tools/gen-config.js 从旧站反推生成',
  '# 默认值见 node_modules/hexo-theme-volantis/_config.yml',
  '# 重新生成: npm run config',
  '',
].join('\n');

fs.writeFileSync(OUT, header + yaml.dump(clean(cfg), { lineWidth: 120, quotingType: '"' }), 'utf8');
console.log('已生成 ' + path.relative(process.cwd(), OUT) + ' (' + fs.statSync(OUT).size + ' 字节)');
