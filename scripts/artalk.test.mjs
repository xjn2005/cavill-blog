import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("shares one configured Artalk component across posts and Links", async () => {
  const [comments, postPage, linksPage] = await Promise.all([
    readFile("src/components/Comments.astro", "utf8"),
    readFile("src/pages/posts/[...slug]/index.astro", "utf8"),
    readFile("src/pages/links.astro", "utf8"),
  ]);

  assert.match(comments, /import Artalk from "artalk"/);
  assert.match(
    comments,
    /import \{ ArtalkKatexPlugin \} from "@artalk\/plugin-katex"/,
  );
  assert.match(comments, /import "artalk\/Artalk\.css"/);
  assert.match(comments, /import "katex\/dist\/katex\.min\.css"/);
  assert.match(comments, /Artalk\.use\(ArtalkKatexPlugin\)/);
  assert.match(comments, /id="Comments"/);
  assert.match(comments, /server: "https:\/\/comment\.cavill\.site"/);
  assert.match(comments, /site: "Cavill Blog"/);
  assert.match(comments, /pageKey: location\.pathname/);
  assert.match(comments, /pageTitle: document\.title/);
  assert.match(comments, /darkMode: isDarkMode\(\)/);
  assert.match(comments, /new MutationObserver/);
  assert.match(comments, /setDarkMode\(darkMode\)/);
  assert.match(
    comments,
    /getEl\(\)\.classList\.toggle\("atk-dark-mode", darkMode\)/,
  );
  assert.match(comments, /astro:page-load/);
  assert.match(comments, /astro:before-swap/);
  assert.match(comments, /\.destroy\(\)/);
  assert.doesNotMatch(comments, /giscus/i);

  for (const page of [postPage, linksPage]) {
    assert.match(page, /import Comments from "@\/components\/Comments\.astro"/);
    assert.match(page, /<Comments \/>/);
    assert.doesNotMatch(page, /giscus\.app/);
  }

  assert.ok(
    postPage.indexOf("<AdjacentPostNav") < postPage.indexOf("<Comments />"),
  );
  assert.ok(
    linksPage.indexOf('id="friend-links-title"') <
      linksPage.indexOf("<Comments />"),
  );
});
