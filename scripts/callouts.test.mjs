import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";
import { calloutOptions } from "../src/config/callouts.js";

test("renders the rant callout with its chat bubble and default title", async () => {
  const processor = await createMarkdownProcessor({
    syntaxHighlight: false,
    rehypePlugins: [[rehypeCallouts, calloutOptions]],
  });
  const { code } = await processor.render(
    "> [!rant]\n> 这段 API 的命名实在令人费解。",
  );

  assert.match(code, /data-callout="rant"/);
  assert.match(code, /class="lucide lucide-message-circle"/);
  assert.match(code, /吐槽/);
});

test("gives the rant callout its dedicated light and dark colors", async () => {
  const styles = await readFile("src/styles/global.css", "utf8");

  assert.match(
    styles,
    /\[data-callout=['"]rant['"]\][\s\S]*--rc-color-light:\s*#5865c9/i,
  );
  assert.match(
    styles,
    /\[data-callout=['"]rant['"]\][\s\S]*--rc-color-dark:\s*#aeb7ff/i,
  );
});
