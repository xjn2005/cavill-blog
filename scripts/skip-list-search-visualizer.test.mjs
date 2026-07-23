import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("documents every current movement and its article placement", async () => {
  const [astroConfig, component, article] = await Promise.all([
    readFile("astro.config.ts", "utf8"),
    readFile("src/components/SkipListSearchVisualizer.tsx", "utf8"),
    readFile("src/content/posts/implementing-a-skip-list-from-scratch.mdx", "utf8"),
  ]);

  assert.match(astroConfig, /import react from "@astrojs\/react"/);
  assert.match(astroConfig, /integrations:\s*\[\s*react\(\),\s*mdx\(\)/);
  assert.match(component, /const executionSteps = \[/);
  assert.match(component, /current: "head"/);
  assert.match(component, /current: "6"/);
  assert.match(component, /current: "7"/);
  assert.match(component, /i = \$\{step\.layer\}/);
  assert.match(component, /current = current->forward\[0\]/);
  assert.match(component, />\s*Head\s*</);
  assert.match(component, /const KEY_WIDTH =/);
  assert.match(component, /const ARRAY_WIDTH =/);
  assert.match(component, /line: "while"/);
  assert.match(component, /line: "decrement"/);
  assert.match(component, /line: "advance"/);
  assert.match(component, /条件不成立：current 保持不动/);
  assert.match(component, /current = current->forward\[0\]/);
  assert.match(component, /return current/);
  assert.match(component, /language-cpp/);
  assert.doesNotMatch(component, /bg-accent/);
  assert.match(
    component,
    /&& <span className=\{syntax\.function\}>comp_<\/span>\(current-&gt;/,
  );
  assert.doesNotMatch(component, /max-w-\[680px\]/);
  assert.match(component, /className="text-foreground w-full"/);
  assert.match(component, /<pre className="border-border mt-4 w-full/);
  assert.doesNotMatch(component, /min-w-\[760px\]/);
  assert.match(component, />\s*←\s*</);
  assert.match(component, />\s*→\s*</);
  assert.doesNotMatch(component, /stepIndex \+ 1/);
  const conclusion = article.indexOf("这样，我们就成功实现了Search功能。");
  const visualizer = article.indexOf("<SkipListSearchVisualizer client:load />");

  assert.ok(conclusion >= 0, "the Search conclusion exists");
  assert.ok(visualizer > conclusion, "the visualizer follows the Search conclusion");
});
