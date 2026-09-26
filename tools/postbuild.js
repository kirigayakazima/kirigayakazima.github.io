/**
 * 构建后处理：补齐 Hexo 不会自动产出的两个文件
 *
 * 1. public/.nojekyll   —— 让 GitHub Pages 跳过 Jekyll 二次处理。
 *                          Hexo 会忽略 source/ 下的点文件，所以只能在构建后补。
 * 2. public/README.md   —— main 分支是构建产物，README 必须随产物一起发布，
 *                          否则下次 force push 会把它覆盖掉，仓库首页就没有说明了。
 *
 * 本地 `npm run build` 与 GitHub Actions 用同一套逻辑，保证产物一致。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUB = path.join(ROOT, 'public');

if (!fs.existsSync(PUB)) {
  console.error('public/ 不存在，请先执行 hexo generate');
  process.exit(1);
}

fs.writeFileSync(path.join(PUB, '.nojekyll'), '');

const readme = path.join(ROOT, 'README.md');
if (fs.existsSync(readme)) {
  fs.copyFileSync(readme, path.join(PUB, 'README.md'));
}

console.log('postbuild: 已写入 public/.nojekyll' + (fs.existsSync(readme) ? ' + public/README.md' : ''));
