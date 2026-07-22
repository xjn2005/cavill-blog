import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const pluginPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/utils/rehypeImageCaptions.js",
);

test("turns standalone image titles into centered captions", async () => {
  assert.equal(existsSync(pluginPath), true, "rehype image caption plugin exists");

  const { default: rehypeImageCaptions } = await import(pathToFileURL(pluginPath).href);
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
            properties: { src: "/demo.png", alt: "demo", title: "Figure 1" },
            children: [],
          },
        ],
      },
    ],
  };

  rehypeImageCaptions()(tree);

  assert.equal(tree.children[0].tagName, "figure");
  assert.deepEqual(tree.children[0].properties.className, ["image-caption"]);
  assert.equal(tree.children[0].children[0].tagName, "img");
  assert.equal(tree.children[0].children[0].properties.title, undefined);
  assert.equal(tree.children[0].children[1].tagName, "figcaption");
  assert.equal(tree.children[0].children[1].properties.className[0], "text-center");
  assert.equal(tree.children[0].children[1].children[0].value, "Figure 1");
});

