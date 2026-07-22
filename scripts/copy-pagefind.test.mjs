import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);

test("copies Pagefind files with Node", async () => {
  const directory = await mkdtemp(join(tmpdir(), "copy-pagefind-"));
  const source = join(directory, "source");
  const destination = join(directory, "destination");

  try {
    await mkdir(source);
    await writeFile(join(source, "pagefind.js"), "export {};");

    await execFileAsync(process.execPath, [
      "scripts/copy-pagefind.mjs",
      source,
      destination,
    ]);

    assert.equal(await readFile(join(destination, "pagefind.js"), "utf8"), "export {};");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
