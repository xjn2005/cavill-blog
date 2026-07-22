import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createPost } from "./new-post.mjs";

test("creates a draft post with a URL-safe filename", async () => {
  const directory = await mkdtemp(join(tmpdir(), "new-post-"));

  try {
    const filePath = await createPost("My First Post!", directory);
    const content = await readFile(filePath, "utf8");

    assert.equal(filePath, join(directory, "my-first-post.md"));
    assert.match(content, /title: "My First Post!"/);
    assert.match(content, /draft: true/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("creates the posts directory when it is missing", async () => {
  const directory = join(await mkdtemp(join(tmpdir(), "new-post-")), "posts");

  try {
    const filePath = await createPost("First Post", directory);

    assert.equal(filePath, join(directory, "first-post.md"));
  } finally {
    await rm(join(directory, ".."), { recursive: true, force: true });
  }
});
