import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

function toSlug(title) {
  const slug = title
    .normalize("NFKD")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) throw new Error("文章标题不能为空。");
  return slug;
}

export async function createPost(title, directory) {
  await mkdir(directory, { recursive: true });
  const filePath = resolve(directory, `${toSlug(title)}.md`);
  const content = `---\ntitle: ${JSON.stringify(title)}\ndescription: ""\npubDatetime: ${new Date().toISOString()}\ntags:\n  - 随笔\ndraft: true\n---\n\n`;

  await writeFile(filePath, content, { encoding: "utf8", flag: "wx" });
  return filePath;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const title = process.argv.slice(2).join(" ").trim();
  const directory = resolve("src/content/posts");

  if (!title) {
    console.error('用法：pnpm new:post -- "文章标题"');
    process.exitCode = 1;
  } else {
    createPost(title, directory)
      .then(filePath => console.log(`已创建：${filePath}`))
      .catch(error => {
        console.error(`创建失败：${error.message}`);
        process.exitCode = 1;
      });
  }
}
