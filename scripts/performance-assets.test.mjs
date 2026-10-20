import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = dirname(fileURLToPath(import.meta.url));

test("serves the site font as WOFF without TTF fallbacks", async () => {
  const config = await readFile("astro.config.ts", "utf8");

  assert.match(config, /formats:\s*\["woff"\]/);
  assert.doesNotMatch(config, /"ttf"/);
});

test("defers non-priority content images without changing explicit priorities", async () => {
  const pluginPath = join(root, "../src/utils/rehypeImagePerformance.js");
  const { default: rehypeImagePerformance } = await import(
    pathToFileURL(pluginPath).href,
  );
  const tree = {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "p",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "img",
            properties: { src: "https://images.example.com/diagram.png" },
            children: [],
          },
        ],
      },
      {
        type: "element",
        tagName: "img",
        properties: { src: "/hero.png", loading: "eager" },
        children: [],
      },
    ],
  };

  rehypeImagePerformance()(tree);

  assert.deepEqual(tree.children[0].children[0].properties, {
    src: "https://images.example.com/diagram.png",
    loading: "lazy",
    decoding: "async",
    fetchPriority: "low",
  });
  assert.deepEqual(tree.children[1].properties, {
    src: "/hero.png",
    loading: "eager",
    decoding: "async",
  });
});
