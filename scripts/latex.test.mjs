import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("configures KaTeX for Markdown math", async () => {
  const [astroConfig, layout, typography] = await Promise.all([
    readFile("astro.config.ts", "utf8"),
    readFile("src/layouts/Layout.astro", "utf8"),
    readFile("src/styles/typography.css", "utf8"),
  ]);

  assert.match(astroConfig, /import remarkMath from "remark-math"/);
  assert.match(astroConfig, /import rehypeKatex from "rehype-katex"/);
  assert.match(layout, /katex\.min\.css/);
  assert.match(typography, /\.app-prose \.katex-display/);
});
