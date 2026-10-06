import assert from "node:assert/strict";
import test from "node:test";
import { getPostWordCount } from "../src/utils/getPostWordCount.js";

test("counts visible Chinese characters and English words", () => {
  const markdown = "## 你好，hello world\n\n[链接](https://example.com)\n\n`code`";

  assert.equal(getPostWordCount(markdown), 7);
});
