import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentPath = "src/components/GoldenSnitchTrajectory.tsx";
const articlePath = "src/content/posts/chasing-the-golden-snitch.mdx";

test("offers reproducible trajectory controls and applies the stated motion model", async () => {
  const component = await readFile(componentPath, "utf8");

  assert.match(component, /seed/);
  assert.match(component, /initialPosition/);
  assert.match(component, /initialVelocity/);
  assert.match(component, /sigma/);
  assert.match(component, /deltaT/);
  assert.match(component, /mulberry32/);
  assert.match(component, /gaussian/);
  assert.match(
    component,
    /position\[axis\]\s*\+\s*initialVelocity\[axis\]\s*\*\s*deltaT\s*\+\s*gaussian\(random\)\s*\*\s*sigma/
  );
  assert.match(component, /<Line points=\{trajectory\}/);
  assert.match(component, /type="text"/);
  assert.match(component, /inputMode/);
  assert.doesNotMatch(component, /type="number"/);
  assert.match(component, /aria-invalid/);
  assert.match(component, /有效范围/);
  assert.match(component, /clampToPitch/);
  assert.match(component, /MIN_HEIGHT/);
  assert.match(component, /GoalPosts/);
  assert.match(component, /Pitch/);
  assert.match(component, /<Pitch \/>/);
  assert.match(component, /<GoalPosts \/>/);
  assert.doesNotMatch(component, /gridHelper/);
  assert.match(component, /<details/);
  assert.doesNotMatch(component, /bg-amber-50/);
});

test("embeds the trajectory visualizer after the stochastic motion model", async () => {
  const article = await readFile(articlePath, "utf8");

  assert.match(article, /import GoldenSnitchTrajectory/);
  assert.ok(
    article.indexOf("\\boldsymbol{\\epsilon}_t") <
      article.indexOf("<GoldenSnitchTrajectory client:load />")
  );
});
