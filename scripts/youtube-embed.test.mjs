import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps embedded videos responsive within article content", async () => {
  const css = await readFile("src/styles/typography.css", "utf8");
  const iframeRule = css.match(/iframe\s*\{(?<rule>[^}]*)}/)?.groups?.rule;

  assert.ok(iframeRule, "iframe style rule exists");
  assert.match(iframeRule, /@apply[^;]*\bblock\b/);
  assert.match(iframeRule, /@apply[^;]*\bw-full\b/);
  assert.match(iframeRule, /@apply[^;]*\bh-auto\b/);
  assert.match(iframeRule, /@apply[^;]*\baspect-video\b/);
});
