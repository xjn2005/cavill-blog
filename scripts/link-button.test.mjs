import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("LinkButton consumers do not override its inline-flex display", async () => {
  const header = await readFile("src/components/Header.astro", "utf8");

  assert.doesNotMatch(header, /focus-outline flex size-full/);
});
