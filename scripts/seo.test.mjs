import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("uses localized SEO identity without changing the application locale", async () => {
  const [config, astroConfig] = await Promise.all([
    readFile("astro-paper.config.ts", "utf8"),
    readFile("astro.config.ts", "utf8"),
  ]);

  assert.match(config, /title: "Cavill's Blog"/);
  assert.match(config, /lang: "en"/);
  assert.match(config, /timezone: "Asia\/Shanghai"/);
  assert.match(astroConfig, /locales: \["en"\]/);
  assert.match(astroConfig, /defaultLocale: "en"/);
});

test("publishes Open Graph and WebSite metadata", async () => {
  const layout = await readFile("src/layouts/Layout.astro", "utf8");

  assert.match(layout, /property="og:locale"/);
  assert.match(layout, /"@type": "WebSite"/);
});

test("describes how to use the Bernstein theorem", async () => {
  const post = await readFile(
    "src/content/posts/如何使用伯恩斯坦定理.md",
    "utf8",
  );

  assert.match(
    post,
    /^description: "伯恩斯坦定理怎么用？本文通过三个典型例题讲解如何构造两个方向的单射、证明集合等势，并总结可复用的证明范式。"$/m,
  );
});
