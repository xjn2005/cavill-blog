# Astro 博客

[![Deploy GitHub Pages](https://github.com/xjn2005/cavill-blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/xjn2005/cavill-blog/actions/workflows/deploy.yml)
[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build)

基于 AstroPaper 的静态博客。

## 开发

```bash
pnpm install
pnpm dev
```

本地服务默认运行在 <http://localhost:4321>。

## 写作与配置

- 文章放在 `src/content/posts/`
- 独立页面放在 `src/content/pages/`
- 网站标题、域名和社交链接在 `astro-paper.config.ts`

## 检查与构建

```bash
pnpm run lint
pnpm run format:check
pnpm run build
```
