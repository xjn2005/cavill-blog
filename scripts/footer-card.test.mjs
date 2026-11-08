import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("shows the blog card before the remaining GitHub and email links", async () => {
  const [siteConfig, footer] = await Promise.all([
    readFile("astro-paper.config.ts", "utf8"),
    readFile("src/components/Footer.astro", "utf8"),
  ]);

  assert.match(
    siteConfig,
    /socials:\s*\[\s*{ name: "github", url: "https:\/\/github\.com\/xjn2005" },\s*{ name: "mail", url: "mailto:2024210214023@stu\.hznu\.edu\.cn" },?\s*\]/s,
  );
  assert.doesNotMatch(siteConfig, /name: "(?:reddit|linkedin)"/);

  assert.match(footer, /href="https:\/\/blog\.cavill\.site\/"/);
  assert.match(
    footer,
    /src="https:\/\/picgocloud\.com\/m\/5c51c36c-707a-4905-b006-f9e368afb58c\.gif"/,
  );
  assert.match(footer, /width="88"/);
  assert.match(footer, /height="31"/);
  assert.match(footer, /alt="Cavill's Blog"/);
  assert.ok(
    footer.indexOf("https://blog.cavill.site/") <
      footer.indexOf("<Socials />"),
  );
});
