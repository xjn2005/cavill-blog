# GEO 设计

## 目标

在不改变文章正文、标题、标签、排版或其他面向读者的页面内容的前提下，增强博客被 Google AI 功能、Bing/Copilot 和 ChatGPT Search 理解、收录和引用的基础条件。文章 `description` 是唯一允许调整的内容字段。

## 范围与约束

- 不创建新的可见页面、区块或导航。
- 不改动文章 Markdown 正文、标题、标签、图片和页面布局。
- 不引入 `llms.txt`；它不是各目标平台的统一要求，且会增加不可验证的维护负担。
- 不将原创文章开放给仅用于模型训练的爬虫。
- 仅使用已有的站点配置、文章 frontmatter、URL 和渲染结果生成机器可读信号。

## 设计

### 站点身份

将站点语言信号统一为 `zh-CN`，使 HTML、Open Graph 和结构化数据与中文内容一致。保留既有域名、站点名称、作者资料和页面外观。

全站 JSON-LD 从基础 `WebSite` 扩展为互相引用的 `WebSite` 与 `Person`：作者的名称、主页和社交资料只来自现有配置。站点数据携带语言、发布者和站内搜索入口；若当前搜索页不支持查询参数，则不输出 `SearchAction`，避免产生无效声明。

### 文章语义

每篇文章继续使用 `BlogPosting`，并补充以下字段：

- `mainEntityOfPage`、文章 URL 和语言；
- `description`、发布日期、修改日期、封面图和字数；
- 文章标签映射出的 `keywords` 与 `articleSection`；
- 与全站 `Person` 发布者的关联；
- 由现有 URL、标题和站点名称生成的 `BreadcrumbList`。

所有字段只读取原有 frontmatter、构建时路径和文章正文长度，不产生或渲染新的读者可见文本。只在原 description 不准确、过短或重复时更新该 frontmatter 字段。

### 爬虫策略

`robots.txt` 将保持通用搜索引擎可抓取，并显式允许 `OAI-SearchBot`，以支持 ChatGPT Search 的发现与引用。同时显式禁止 `GPTBot`，使允许搜索展示不等同于允许训练用途。Googlebot、bingbot 和其他现有允许的搜索爬虫不受影响。

### 验证

新增自动化测试覆盖：

- 页面输出正确的语言、canonical、文章 JSON-LD 和面包屑；
- 每个声明都来自已有数据，且不含空 URL 或空图片字段；
- robots 规则同时允许 `OAI-SearchBot` 并禁止 `GPTBot`；
- 站点 sitemap 仍可被发现；
- 生产构建、现有测试与格式检查均通过。

验证不会修改文章正文，并会在最终检查时确认 Git diff 只包含实现文件、允许变更的 `description` 及内部文档。

## 错误处理

结构化数据中的可选字段（封面图、修改日期和作者主页）只在存在有效值时输出。URL 全部由 Astro 的站点 URL 或当前请求 URL 解析，避免相对 URL 进入 JSON-LD。任何不符合 schema 的文章都继续由 Astro 内容校验在构建阶段阻止发布。
