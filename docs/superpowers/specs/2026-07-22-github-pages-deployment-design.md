# GitHub Pages 部署设计

## 目标

将 `main` 分支自动部署到 GitHub Pages，站点地址为 `https://xjn2005.github.io/cavill-blog/`。

## 改动

- 新增 GitHub Actions workflow：安装依赖、执行生产构建、上传 `dist` 并发布到 GitHub Pages。
- 为 Astro 设置上述站点地址和 `/cavill-blog` 基础路径，确保静态资源、链接和生成的 URL 在项目页面下正常工作。
- 在 README 顶部保留两个徽章：GitHub Pages 部署状态和 Astro。
- 页脚保留版权年份，只将 `All rights reserved.` 替换为简洁的 `Content licensed under CC BY-NC-SA 4.0.`，并链接到 Creative Commons 许可说明。

## 前置条件

仓库 Settings → Pages 的 Source 需选择 GitHub Actions。首次部署会由 workflow 自动创建 Pages 发布记录。

## 验证

在本地执行 `pnpm run build`；推送到 `main` 后在 Actions 中确认部署 workflow 成功，并访问目标地址检查首页、About、文章和静态资源。
