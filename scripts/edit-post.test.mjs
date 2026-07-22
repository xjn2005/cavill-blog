import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("uses this repository for post edit links", async () => {
  const config = await readFile("astro-paper.config.ts", "utf8");

  assert.match(
    config,
    /url: "https:\/\/github\.com\/xjn2005\/cavill-blog\/edit\/main\/"/,
  );
});
