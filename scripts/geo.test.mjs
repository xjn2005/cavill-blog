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

test("publishes complete article and breadcrumb JSON-LD from existing post data", async () => {
  const [layout, postPage] = await Promise.all([
    readFile("src/layouts/PostLayout.astro", "utf8"),
    readFile("src/pages/posts/[...slug]/index.astro", "utf8"),
  ]);

  assert.match(layout, /"@type": "BlogPosting"/);
  assert.match(layout, /"@type": "BreadcrumbList"/);
  assert.match(layout, /mainEntityOfPage/);
  assert.match(layout, /inLanguage: site\.contentLanguage/);
  assert.match(layout, /wordCount/);
  assert.match(layout, /articleSection/);
  assert.match(postPage, /description=\{description\}/);
  assert.match(postPage, /keywords=\{tags\}/);
  assert.match(postPage, /\{wordCount\}/);
});

test("allows ChatGPT Search while blocking model-training crawls", async () => {
  const robots = await readFile("src/pages/robots.txt.ts", "utf8");

  assert.match(robots, /User-agent: OAI-SearchBot\s+Allow: \//);
  assert.match(robots, /User-agent: GPTBot\s+Disallow: \//);
  assert.match(robots, /User-agent: \*\s+Allow: \//);
  assert.match(robots, /Sitemap: \$\{sitemapURL\.href\}/);
});
