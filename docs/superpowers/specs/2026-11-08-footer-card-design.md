# 底栏卡片与社交链接精简设计

## 目标

将底栏的四个社交链接精简为 GitHub 和 Email，并在许可证信息右侧、GitHub 左侧插入 Cavill's Blog 的 88×31 GIF 卡片。

## 结构

- `astro-paper.config.ts` 的 `socials` 仅保留 GitHub 和 Email，继续作为社交链接的单一配置来源。
- `Footer.astro` 将卡片和现有 `Socials` 组件包在同一个右侧组合中；卡片属于底栏内容，不扩展通用社交链接的数据模型。
- 桌面端从左到右显示：许可证信息、卡片、GitHub、Email。
- 移动端沿用当前纵向底栏布局：卡片与 GitHub、Email 位于同一行，许可证信息位于其下方。

## 卡片属性

- 目标地址：`https://blog.cavill.site/`
- 图片地址：`https://picgocloud.com/m/5c51c36c-707a-4905-b006-f9e368afb58c.gif`
- 固定尺寸：88×31
- 替代文本：`Cavill's Blog`

## 验证

- 检查社交配置只包含 GitHub 和 Email，且顺序不变。
- 运行生产构建，确认 Astro 模板和样式编译成功。
- 检查桌面端与移动端底栏的顺序、间距和图片尺寸。
