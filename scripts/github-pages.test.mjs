import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("configures the GitHub Pages custom domain", async () => {
  const [siteConfig, astroConfig] = await Promise.all([
    readFile("astro-paper.config.ts", "utf8"),
    readFile("astro.config.ts", "utf8"),
  ]);

  assert.match(
    siteConfig,
    /url: "https:\/\/blog\.cavill\.site\/"/,
  );
  assert.doesNotMatch(astroConfig, /base: "\/cavill-blog"/);
});

test("deploys the built site to GitHub Pages", async () => {
  const workflow = await readFile(".github/workflows/deploy.yml", "utf8");

  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /uses: actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /uses: actions\/deploy-pages@v4/);
  assert.match(workflow, /path: \.\/dist/);
});

test("shows deployment badges and the content license", async () => {
  const [readme, footer] = await Promise.all([
    readFile("README.md", "utf8"),
    readFile("src/components/Footer.astro", "utf8"),
  ]);

  assert.match(readme, /actions\/workflows\/deploy\.yml\/badge\.svg/);
  assert.match(readme, /img\.shields\.io\/badge\/Astro-7/);
  assert.match(footer, /Content: CC BY-NC-SA 4\.0\./);
  assert.doesNotMatch(footer, /allRightsReserved/);
});
