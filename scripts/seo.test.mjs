import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("uses Chinese SEO identity", async () => {
  const config = await readFile("astro-paper.config.ts", "utf8");

  assert.match(config, /title: "Cavill 的博客"/);
  assert.match(config, /lang: "zh-CN"/);
  assert.match(config, /timezone: "Asia\/Shanghai"/);
});

test("publishes Chinese Open Graph and WebSite metadata", async () => {
  const layout = await readFile("src/layouts/Layout.astro", "utf8");

  assert.match(layout, /property="og:locale"/);
  assert.match(layout, /"@type": "WebSite"/);
});
