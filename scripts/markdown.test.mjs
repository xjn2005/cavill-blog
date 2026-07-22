import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("configures single newlines as Markdown line breaks", async () => {
  const astroConfig = await readFile("astro.config.ts", "utf8");

  assert.match(astroConfig, /import remarkBreaks from "remark-breaks"/);
  assert.match(astroConfig, /remarkPlugins: \[\s*remarkBreaks,/);
});

test("configures Chinese Markdown typography", async () => {
  const astroConfig = await readFile("astro.config.ts", "utf8");

  assert.match(
    astroConfig,
    /import mdFormat from "@cavillxu\/astro-md-format"/,
  );
  assert.match(astroConfig, /mdFormat\(\),/);
});
