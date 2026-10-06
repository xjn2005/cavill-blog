import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://blog.cavill.site/",
    title: "Cavill 的博客",
    description:
      "Cavill 的个人技术博客，记录计算机科学、数学和软件工程的学习与实践。",
    author: "Cavill",
    profile: "https://github.com/xjn2005",
    ogImage: "default-og.jpg",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/xjn2005/cavill-blog/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/xjn2005" },
    { name: "reddit", url: "https://www.reddit.com/user/SmokeNo4763/" },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/jianing-xu-96226b412/",
    },
    { name: "mail", url: "mailto:2024210214023@stu.hznu.edu.cn" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
