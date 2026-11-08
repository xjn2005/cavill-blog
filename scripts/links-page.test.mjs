import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("adds Links between Tags and About without removing header controls", async () => {
  const [header, breadcrumb, uiTypes, english] = await Promise.all([
    readFile("src/components/Header.astro", "utf8"),
    readFile("src/components/Breadcrumb.astro", "utf8"),
    readFile("src/i18n/types.ts", "utf8"),
    readFile("src/i18n/lang/en.ts", "utf8"),
  ]);

  const tagsIndex = header.indexOf('getRelativeLocaleUrl(locale, "tags")');
  const linksIndex = header.indexOf('getRelativeLocaleUrl(locale, "links")');
  const aboutIndex = header.indexOf('getRelativeLocaleUrl(locale, "about")');

  assert.ok(tagsIndex >= 0);
  assert.ok(linksIndex > tagsIndex);
  assert.ok(aboutIndex > linksIndex);

  for (const existingControl of [
    'getRelativeLocaleUrl(locale, "posts")',
    'getRelativeLocaleUrl(locale, "archives")',
    'getRelativeLocaleUrl(locale, "search")',
    'id="theme-btn"',
  ]) {
    assert.match(
      header,
      new RegExp(existingControl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }

  assert.match(header, /"active-nav": isActive\("\/links"\)/);
  assert.match(breadcrumb, /links: t\.nav\.links/);
  assert.match(uiTypes, /links: string;/);
  assert.match(english, /links: "Links"/);
});
