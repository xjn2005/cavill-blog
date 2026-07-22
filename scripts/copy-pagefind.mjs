import { cp } from "node:fs/promises";

const [source = "dist/pagefind", destination = "public/pagefind"] =
  process.argv.slice(2);

await cp(source, destination, { recursive: true, force: true });
