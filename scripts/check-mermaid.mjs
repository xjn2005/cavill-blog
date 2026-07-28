import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [astroConfig, postPage, typography] = await Promise.all([
  readFile("astro.config.ts", "utf8"),
  readFile("src/pages/posts/[...slug]/index.astro", "utf8"),
  readFile("src/styles/typography.css", "utf8"),
]);

assert.match(astroConfig, /excludeLangs:\s*\[\s*["']mermaid["']\s*\]/);
assert.match(postPage, /import\(["']mermaid["']\)/);
assert.match(postPage, /code\.language-mermaid, pre\[data-language='mermaid'\] > code/);
assert.match(postPage, /mermaidSource/);
assert.match(postPage, /MutationObserver/);
assert.match(
  typography,
  /\.app-prose \.mermaid\s*\{\s*@apply mx-auto w-fit max-w-full;/
);
