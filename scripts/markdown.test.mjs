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

function inlineMath(markdown) {
  const spans = [];

  for (let index = 0; index < markdown.length; index += 1) {
    if (markdown[index] !== "$" || markdown[index - 1] === "\\") continue;

    const end = markdown.indexOf("$", index + 1);
    if (end === -1) break;

    spans.push(markdown.slice(index + 1, end));
    index = end;
  }

  return spans;
}
