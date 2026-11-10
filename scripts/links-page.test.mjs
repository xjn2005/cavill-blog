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

test("renders complete 88x31 HTML, copy feedback, and the friend wall", async () => {
  const [page, data, english] = await Promise.all([
    readFile("src/pages/links.astro", "utf8"),
    readFile("src/data/friendLinks.ts", "utf8"),
    readFile("src/i18n/lang/en.ts", "utf8"),
  ]);

  for (const component of [
    "Layout",
    "Header",
    "Breadcrumb",
    "Main",
    "Comments",
    "Footer",
  ]) {
    assert.match(page, new RegExp(`<${component}(?:\\s|\\/>|>)`));
  }

  assert.match(
    english,
    /这里收录互联网的朋友们。只接受 88×31 的卡片形式——我觉得这些卡片是互联网的邮票，而我喜欢集邮。欢迎通过 Email 联系我，或在评论区留言。申请时请提供以下 HTML：/,
  );

  assert.ok(
    page.includes('const applicationHtml = `<a href="https://example.com/">'),
  );
  assert.ok(page.includes('src="https://example.com/button.gif"'));
  assert.ok(page.includes('alt="站点名称"'));

  assert.ok(
    page.includes(
      'const ownButtonHtml = `<a href="https://blog.cavill.site/">',
    ),
  );
  assert.ok(
    page.includes(
      'src="https://picgocloud.com/m/5c51c36c-707a-4905-b006-f9e368afb58c.gif"',
    ),
  );
  assert.ok(page.includes('alt="Cavill\'s Blog"'));
  assert.match(page, /data-copy-text={ownButtonHtml}/);
  assert.match(page, /navigator\.clipboard\.writeText/);
  assert.match(page, /已复制/);
  assert.match(page, /复制失败/);
  assert.match(page, /aria-live="polite"/);
  assert.doesNotMatch(page, /<code>{ownButtonHtml}<\/code>/);
  assert.doesNotMatch(page, /完整的 88×31 卡片 HTML/);

  assert.match(page, /friendLinks\.length > 0/);
  assert.match(page, /t\.pages\.linksEmpty/);
  assert.match(
    page,
    /<div\s+class="border-border mt-4 rounded-lg border border-dashed p-4"[\s\S]*friendLinks\.length > 0/,
  );
  assert.match(
    page,
    /<a href={url}>[\s\S]*<img src={imageUrl} width="88" height="31" alt={name} \/>[\s\S]*<\/a>/,
  );
  assert.doesNotMatch(page, /<a href={url}[^>]+>/);

  assert.match(data, /export type FriendLink = Readonly</);
  assert.match(data, /name: string;/);
  assert.match(data, /url: string;/);
  assert.match(data, /imageUrl: string;/);
  assert.match(data, /name: "PaddySun"/);
  assert.match(data, /url: "https:\/\/www\.paddysun\.top\/"/);
  assert.match(
    data,
    /imageUrl: "https:\/\/cos\.paddysun\.top\/88x31\/paddy-88x31-clouds\.webp"/,
  );

  assert.ok(page.indexOf("<Comments") > page.indexOf('id="friend-links-title"'));
});
