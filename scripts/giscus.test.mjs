import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("shares one configured Giscus component across posts and Links", async () => {
  const [comments, postPage, linksPage] = await Promise.all([
    readFile("src/components/Comments.astro", "utf8"),
    readFile("src/pages/posts/[...slug]/index.astro", "utf8"),
    readFile("src/pages/links.astro", "utf8"),
  ]);

  assert.match(comments, /src="https:\/\/giscus\.app\/client\.js"/);
  assert.match(comments, /data-repo="xjn2005\/cavill-blog"/);
  assert.match(comments, /data-category="Comments"/);
  assert.match(comments, /data-mapping="pathname"/);
  assert.match(comments, /data-lang="zh-CN"/);

  for (const page of [postPage, linksPage]) {
    assert.match(page, /import Comments from "@\/components\/Comments\.astro"/);
    assert.match(page, /<Comments \/>/);
    assert.doesNotMatch(page, /src="https:\/\/giscus\.app\/client\.js"/);
  }

  assert.ok(
    postPage.indexOf("<AdjacentPostNav") < postPage.indexOf("<Comments />"),
  );
  assert.ok(
    linksPage.indexOf('id="friend-links-title"') <
      linksPage.indexOf("<Comments />"),
  );
});
