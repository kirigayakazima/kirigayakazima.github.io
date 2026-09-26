# kirigayakazima.github.io

个人技术博客源码 — **https://kirigayakazima.github.io/**

基于 **Hexo 8 + Volantis 5.4.0**，记录嵌入式开发、数字 IC 设计、数据结构与算法的学习笔记。

## 关于这个仓库的两个分支

| 分支 | 内容 | 说明 |
| --- | --- | --- |
| `source` | **博客源码** | 日常在这里改，push 后自动构建发布 |
| `main` | 构建产物 | 由 GitHub Actions 自动生成，是 GitHub Pages 的发布源。**请勿手动修改**，下次部署会被全量覆盖 |

clone 后默认拿到的是 `main`（纯静态产物）。要改博客请切换到源码分支：

```bash
git clone -b source https://github.com/kirigayakazima/kirigayakazima.github.io.git
```

## 本地开发

```bash
npm ci        # 安装依赖（.npmrc 已处理 peer 依赖冲突）
npm run dev   # 清理并启动本地预览，默认 http://localhost:4000
```

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 清理 + 启动本地预览 |
| `npm run build` | 构建静态文件到 `public/` |
| `npm run new <标题>` | 新建文章 |
| `npm run config` | 重新生成 `_config.volantis.yml` |
| `npm run images` | 把外链图片下载到本地（`-- -r` 撤销改写） |
| `npm run migrate` | 从旧站 HTML 重新迁移文章（需用 `BLOG_SRC` 指定数据源） |

## 部署流程

push 到 `source` 分支即自动发布，无需手动操作：

1. GitHub Actions 执行 `npm ci` + `hexo generate`
2. **Sanity check**：首页与 404 非空、逐篇校验文章的日期路径（防止时区问题导致旧链接 404）
3. 把 `public/` 强制推送到 `main`
4. GitHub Pages 自动上线

构建日志见仓库的 **Actions** 标签页。

## 目录结构（source 分支）

```
source/
  _posts/        文章 Markdown（32 篇）
  _volantis/     主题魔改样式（style.styl / first.styl）
  images/         本地化图片（55 张，不依赖外网）
  js/             魔改的前端脚本，会覆盖主题同名文件
  about.md 等     独立页面
tools/
  gen-config.js         生成主题配置
  download-images.js    图片本地化
  migrate.js            旧站文章迁移
  legacy/content.json   迁移数据源
.github/workflows/
  deploy.yml            构建与发布
_config.yml             站点配置
_config.volantis.yml    主题配置（由 gen-config.js 生成）
```

## 技术栈

Hexo 8 · Volantis 5.4.0 · Stylus · GitHub Actions · GitHub Pages
