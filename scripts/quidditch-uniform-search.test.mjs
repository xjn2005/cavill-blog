import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentPath = "src/components/QuidditchUniformSearch.tsx";
const articlePath = "src/content/posts/chasing-the-golden-snitch.mdx";

test("renders a canonical 3D Quidditch pitch with view controls", async () => {
  const component = await readFile(componentPath, "utf8");

  assert.match(component, /export function GoalPosts/);
  assert.match(component, /export function Pitch/);
  assert.match(component, /PITCH_LENGTH = 500/);
  assert.match(component, /PITCH_WIDTH = 180/);
  assert.match(component, /GOAL_POST_HEIGHT = 50/);
  assert.match(component, /const pitchEdgeX/);
  assert.match(component, /Math\.sqrt/);
  assert.match(component, /Canvas/);
  assert.match(component, /OrbitControls/);
  assert.match(component, /enableZoom=\{false\}/);
  assert.match(component, /cylinderGeometry/);
  assert.match(component, /torusGeometry/);
  assert.match(component, /bottom-3/);
  assert.match(component, /right-3/);
  assert.match(component, /title="重置视角"/);
  assert.match(component, /enablePan=\{false\}/);
  assert.doesNotMatch(component, /onWheel|WheelEvent/);
  assert.match(component, /<color attach="background" args=\{\["#ffffff"\]\}/);
  assert.doesNotMatch(component, /#0b1712/);
  assert.doesNotMatch(component, /<fog/);
  assert.doesNotMatch(component, /rounded-xl|bg-muted\/30|均匀先验分布/);
});

test("places the visualizer after the uniform-distribution assumption", async () => {
  const article = await readFile(articlePath, "utf8");

  assert.match(article, /import QuidditchUniformSearch/);
  assert.ok(
    article.indexOf("服从均匀分布") <
      article.indexOf("<QuidditchUniformSearch client:load />")
  );
});
