import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  getCommandArguments,
  getAddedPostFiles,
  getIndexNowUrls,
  getPostUrls,
  parseSitemapUrls,
  submitIndexNow,
  writeIndexNowKeyFile,
} from "./indexnow.mjs";

test("ignores pnpm's argument separator", () => {
  assert.deepEqual(getCommandArguments(["submit", "--", "indexnow-urls.json"]), [
    "submit",
    "indexnow-urls.json",
  ]);
});

test("keeps only newly added Markdown posts", () => {
  const status = [
    "A\tsrc/content/posts/new.md",
    "A\tsrc/content/posts/drafts/second.mdx",
    "M\tsrc/content/posts/old.md",
    "A\tsrc/pages/about.astro",
  ].join("\n");

  assert.deepEqual(getAddedPostFiles(status), [
    "src/content/posts/new.md",
    "src/content/posts/drafts/second.mdx",
  ]);
});

test("derives published post URLs from source paths", () => {
  assert.deepEqual(
    getPostUrls(
      ["src/content/posts/算法/Hello World.mdx"],
      "https://blog.cavill.site/"
    ),
    ["https://blog.cavill.site/posts/%E7%AE%97%E6%B3%95/hello-world/"]
  );
});

test("keeps only candidate URLs emitted in sitemap", () => {
  const sitemap = [
    "<?xml version=\"1.0\"?>",
    "<urlset>",
    "  <url><loc>https://blog.cavill.site/posts/new/</loc></url>",
    "  <url><loc>https://blog.cavill.site/posts/old/</loc></url>",
    "</urlset>",
  ].join("\n");

  assert.deepEqual(parseSitemapUrls(sitemap), [
    "https://blog.cavill.site/posts/new/",
    "https://blog.cavill.site/posts/old/",
  ]);
  assert.deepEqual(
    getIndexNowUrls(
      ["https://blog.cavill.site/posts/new/"],
      parseSitemapUrls(sitemap)
    ),
    ["https://blog.cavill.site/posts/new/"]
  );
});

test("writes the required root verification file", async () => {
  const directory = await mkdtemp(join(tmpdir(), "indexnow-"));
  const key = "abcd1234";

  try {
    const file = await writeIndexNowKeyFile(directory, key);
    assert.equal(file, join(directory, `${key}.txt`));
    assert.equal(await readFile(file, "utf8"), key);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("does not submit an empty URL list", async () => {
  let fetchCalled = false;

  const response = await submitIndexNow({
    key: "abcd1234",
    urls: [],
    fetch: async () => {
      fetchCalled = true;
      return new Response(null, { status: 200 });
    },
  });

  assert.equal(response, null);
  assert.equal(fetchCalled, false);
});

test("submits the selected URLs without exposing the key", async () => {
  let request;
  const response = await submitIndexNow({
    key: "abcd1234",
    urls: ["https://blog.cavill.site/posts/new/"],
    fetch: async (url, options) => {
      request = { url, options };
      return new Response(null, { status: 202 });
    },
  });

  assert.equal(response.status, 202);
  assert.equal(request.url, "https://api.indexnow.org/indexnow");
  assert.deepEqual(JSON.parse(request.options.body), {
    host: "blog.cavill.site",
    key: "abcd1234",
    keyLocation: "https://blog.cavill.site/abcd1234.txt",
    urlList: ["https://blog.cavill.site/posts/new/"],
  });
});
