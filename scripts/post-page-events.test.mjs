import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("runs the Node tests in CI", async () => {
  const [packageJson, workflow] = await Promise.all([
    readFile("package.json", "utf8"),
    readFile(".github/workflows/ci.yml", "utf8"),
  ]);

  assert.equal(JSON.parse(packageJson).scripts.test, "node --test scripts/*.test.mjs");
  assert.match(workflow, /run: pnpm test/);
});

test("binds post-wide event listeners once", async () => {
  const page = await readFile("src/pages/posts/[...slug]/index.astro", "utf8");

  assert.match(page, /if \(window\.__postProgressBound\) return;/);
  assert.match(page, /if \(!window\.__postScrollRestoreBound\)/);
});
