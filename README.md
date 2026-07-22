# Astro 博客

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
