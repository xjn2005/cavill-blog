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
