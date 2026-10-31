import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

test("configures single newlines as Markdown line breaks", async () => {
  const astroConfig = await readFile("astro.config.ts", "utf8");

  assert.match(
    astroConfig,
    /import {[^}]*\bunified\b[^}]*} from "@astrojs\/markdown-remark"/,
  );
  assert.match(astroConfig, /import remarkBreaks from "remark-breaks"/);
  assert.match(astroConfig, /processor: unified\(\{\s*remarkPlugins: \[\s*remarkBreaks,/);
  assert.doesNotMatch(astroConfig, /^ {4}remarkPlugins:/m);
  assert.doesNotMatch(astroConfig, /^ {4}rehypePlugins:/m);
});

test("configures Chinese Markdown typography", async () => {
  const astroConfig = await readFile("astro.config.ts", "utf8");

  assert.match(
    astroConfig,
    /import { remarkMdFormat } from "@cavillxu\/astro-md-format"/,
  );
  assert.match(
    astroConfig,
    /remarkPlugins: \[\s*remarkBreaks,\s*remarkMath,\s*remarkMdFormat as unknown as RemarkPlugin,/,
  );
  assert.doesNotMatch(astroConfig, /mdFormat\(\),/);
});

test("keeps Chinese punctuation out of inline math", async () => {
  const postDir = "src/content/posts";
  const markdownFiles = (await readdir(postDir))
    .filter(fileName => fileName.endsWith(".md"))
    .map(fileName => join(postDir, fileName));

  for (const filePath of markdownFiles) {
    const markdown = await readFile(filePath, "utf8");

    for (const math of inlineMath(markdown)) {
      assert.equal(math.includes("、"), false, `${filePath}: ${math}`);
    }
  }
});

test("keeps the upper and lower bounds explainer inside its callout", async () => {
  const post = await readFile(
    "src/content/posts/如何理解实变函数的上下极限.md",
    "utf8",
  );
  assert.match(
    post,
    /> \[!info\] 什么是上、下确界\n(?:>.*\n)*> > \[!example\][^\n]*/,
    "expected the example callout to remain inside the bounds explainer",
  );

  const example = post.match(
    /> > \[!example\][^\n]*\n([\s\S]*?)\n(?:>\n)?\n+(?=随着 \$n\$ 增大)/,
  );

  assert.ok(example, "expected an example callout nested in the bounds explainer");

  for (const line of example[1].trimEnd().split("\n")) {
    assert.match(line, /^> >/, `nested example line must start with \"> >\": ${line}`);
  }
});

test("places set-limit indices below limsup and liminf in inline explanations", async () => {
  const post = await readFile(
    "src/content/posts/如何理解实变函数的上下极限.md",
    "utf8",
  );

  assert.match(
    post,
    /\$x\\in\\displaystyle\\limsup\\limits_\{n\\to\\infty\}A_n\$/,
  );
  assert.match(
    post,
    /\$x\\in\\displaystyle\\liminf\\limits_\{n\\to\\infty\}A_n\$/,
  );
  assert.match(
    post,
    /共同的集合记为 \$\\displaystyle\\lim\\limits_\{n\\to\\infty\}A_n\$/,
  );
});

test("ignores dollar signs in fenced code blocks when finding inline math", () => {
  const markdown = [
    "```powershell",
    "$first = 1",
    "$second = '、'",
    "```",
    "",
    "正文中的 $x$ 应保留。",
  ].join("\n");

  assert.deepEqual(inlineMath(markdown), ["x"]);
});

function inlineMath(markdown) {
  const spans = [];
  let fence = null;
  const prose = markdown
    .split(/\r?\n/)
    .map(line => {
      const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);

      if (match) {
        const marker = match[1];

        if (!fence) {
          fence = { character: marker[0], length: marker.length };
        } else if (
          marker[0] === fence.character &&
          marker.length >= fence.length &&
          match[2].trim() === ""
        ) {
          fence = null;
        }

        return "";
      }

      return fence ? "" : line;
    })
    .join("\n");

  for (let index = 0; index < prose.length; index += 1) {
    if (prose[index] !== "$" || prose[index - 1] === "\\") continue;

    const end = prose.indexOf("$", index + 1);
    if (end === -1) break;

    spans.push(prose.slice(index + 1, end));
    index = end;
  }

  return spans;
}
