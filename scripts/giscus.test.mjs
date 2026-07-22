import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("renders the configured Giscus comments widget on post pages", async () => {
  const page = await readFile(
    "src/pages/posts/[...slug]/index.astro",
    "utf8"
  );

  assert.match(page, /src="https:\/\/giscus\.app\/client\.js"/);
  assert.match(page, /data-repo="xjn2005\/cavill-blog"/);
  assert.match(page, /data-lang="zh-CN"/);
  assert.ok(
    page.indexOf("<AdjacentPostNav") < page.indexOf('aria-label="评论"')
  );
});
