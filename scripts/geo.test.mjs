import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("publishes a Chinese content language without changing the app locale", async () => {
  const [siteConfig, resolvedConfig, layout] = await Promise.all([
    readFile("astro-paper.config.ts", "utf8"),
    readFile("src/config.ts", "utf8"),
    readFile("src/layouts/Layout.astro", "utf8"),
  ]);

  assert.match(siteConfig, /contentLanguage: "zh-CN"/);
  assert.match(resolvedConfig, /contentLanguage:/);
  assert.match(layout, /lang=\{contentLanguage\}/);
  assert.match(layout, /property="og:locale" content=\{ogLocale\}/);
});

test("publishes linked WebSite, Person, and SearchAction entities", async () => {
  const layout = await readFile("src/layouts/Layout.astro", "utf8");

  assert.match(layout, /"@graph"/);
  assert.match(layout, /"@type": "WebSite"/);
  assert.match(layout, /"@type": "Person"/);
  assert.match(layout, /"@type": "SearchAction"/);
  assert.match(layout, /sameAs/);
});
