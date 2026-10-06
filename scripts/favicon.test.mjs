import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import sharp from "sharp";

const faviconPath = fileURLToPath(
  new URL("../public/my-favicon-48.png", import.meta.url)
);
const layoutPath = fileURLToPath(
  new URL("../src/layouts/Layout.astro", import.meta.url)
);

test("uses a compact 48px PNG favicon", async () => {
  assert.ok(
    existsSync(faviconPath),
    "public/my-favicon-48.png must exist"
  );

  const favicon = await sharp(faviconPath).metadata();
  assert.equal(favicon.format, "png");
  assert.equal(favicon.width, 48);
  assert.equal(favicon.height, 48);

  const faviconBytes = await readFile(faviconPath);
  assert.ok(faviconBytes.byteLength < 15 * 1024);

  const layout = await readFile(layoutPath, "utf8");
  assert.match(layout, /type="image\/png"/);
  assert.match(layout, /getAssetPath\("my-favicon-48\.png"\)/);
});
