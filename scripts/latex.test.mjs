import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { hasMath } from "../src/utils/hasMath.js";

test("detects supported Markdown math delimiters without treating a lone dollar sign as math", () => {
  assert.equal(hasMath("Inline $x^2$ math."), true);
  assert.equal(hasMath("$$\\na^2 + b^2 = c^2\\n$$"), true);
  assert.equal(hasMath("A shell variable $HOME is not a formula."), false);
  assert.equal(hasMath("Plain prose."), false);
});

test("uses backslash parity when deciding whether dollar math delimiters are escaped", () => {
  assert.equal(hasMath(String.raw`\\$x$`), true);
  assert.equal(hasMath(String.raw`\$x$`), false);
  assert.equal(hasMath(String.raw`\\$$x$$`), true);
  assert.equal(hasMath(String.raw`\$$x$$`), false);
});

test("ignores non-body Markdown regions and unsupported math delimiters", () => {
  assert.equal(
    hasMath('---\ntitle: "Formula $x$"\n---\nPlain prose.'),
    false
  );
  assert.equal(hasMath("```js\nconst formula = '$x$';\n```"), false);
  assert.equal(hasMath("Use `$x$` as literal code."), false);
  assert.equal(hasMath(String.raw`\\(x\\)`), false);
});

test("configures local KaTeX only for Markdown posts containing math", async () => {
  const [astroConfig, layout, postLayout, postRoute, typography] = await Promise.all([
    readFile("astro.config.ts", "utf8"),
    readFile("src/layouts/Layout.astro", "utf8"),
    readFile("src/layouts/PostLayout.astro", "utf8"),
    readFile("src/pages/posts/[...slug]/index.astro", "utf8"),
    readFile("src/styles/typography.css", "utf8"),
  ]);

  assert.match(astroConfig, /import remarkMath from "remark-math"/);
  assert.match(astroConfig, /import rehypeKatex from "rehype-katex"/);
  assert.doesNotMatch(layout, /cdn\.jsdelivr\.net\/npm\/katex/);
  assert.match(postRoute, /import \{ hasMath \} from "@\/utils\/hasMath\.js"/);
  assert.match(postRoute, /hasMath=\{hasMath\(post\.body\)\}/);
  assert.match(postLayout, /import katexCssUrl from "katex\/dist\/katex\.min\.css\?url"/);
  assert.match(postLayout, /hasMath\?: boolean/);
  assert.match(postLayout, /\{hasMath && <link rel="stylesheet" href=\{katexCssUrl\} \/>\}/);
  assert.match(typography, /\.app-prose \.katex-display/);
});
