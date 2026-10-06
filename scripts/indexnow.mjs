import { execFile as execFileCallback } from "node:child_process";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import kebabcase from "lodash.kebabcase";
import slugify from "slugify";

const execFile = promisify(execFileCallback);
const defaultSiteUrl = "https://blog.cavill.site/";
const keyPattern = /^[A-Za-z0-9-]{8,128}$/;

function slugifySegment(segment) {
  return /[^\x00-\x7F]/.test(segment)
    ? kebabcase(segment)
    : slugify(segment, { lower: true });
}

function validateKey(key) {
  if (!keyPattern.test(key ?? "")) {
    throw new Error("INDEXNOW_KEY must contain 8 to 128 letters, numbers, or hyphens.");
  }
}

export function getAddedPostFiles(nameStatus) {
  return nameStatus.split("\n").flatMap(line => {
    const [status, file] = line.split("\t");
    return status === "A" && /^src\/content\/posts\/.+\.(md|mdx)$/.test(file)
      ? [file]
      : [];
  });
}

export function getPostUrls(files, siteUrl = defaultSiteUrl) {
  return files.map(file => {
    const relativePath = file
      .replace(/^src\/content\/posts\//, "")
      .replace(/\.(md|mdx)$/, "");
    const segments = relativePath.split("/").map(slugifySegment);
    return new URL(`posts/${segments.join("/")}/`, siteUrl).href;
  });
}

export function parseSitemapUrls(sitemap) {
  return Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), match => match[1]);
}

export function getIndexNowUrls(candidates, sitemapUrls) {
  const sitemap = new Set(sitemapUrls);
  return candidates.filter(url => sitemap.has(url));
}

export async function writeIndexNowKeyFile(outputDirectory, key) {
  validateKey(key);
  const file = join(outputDirectory, `${key}.txt`);
  await writeFile(file, key, "utf8");
  return file;
}

export async function submitIndexNow({
  key,
  urls,
  siteUrl = defaultSiteUrl,
  fetch: request = globalThis.fetch,
}) {
  validateKey(key);
  if (urls.length === 0) return null;

  const site = new URL(siteUrl);
  const response = await request("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: site.hostname,
      key,
      keyLocation: new URL(`${key}.txt`, site).href,
      urlList: urls,
    }),
  });

  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow rejected the submission with HTTP ${response.status}.`);
  }

  return response;
}

async function getSitemapUrls(outputDirectory) {
  const files = await readdir(outputDirectory);
  const sitemapFiles = files.filter(file => /^sitemap-\d+\.xml$/.test(file));
  const sitemaps = await Promise.all(
    sitemapFiles.map(file => readFile(join(outputDirectory, file), "utf8"))
  );
  return sitemaps.flatMap(parseSitemapUrls);
}

async function getChangedFiles(before, sha) {
  if (!before || !sha || /^0+$/.test(before)) return "";

  const { stdout } = await execFile("git", [
    "diff",
    "--name-status",
    "--diff-filter=A",
    before,
    sha,
    "--",
    "src/content/posts",
  ]);
  return stdout;
}

async function prepare() {
  const key = process.env.INDEXNOW_KEY;
  const outputDirectory = process.env.INDEXNOW_OUTPUT_DIRECTORY ?? "dist";
  const manifest = process.env.INDEXNOW_MANIFEST ?? "indexnow-urls.json";
  const siteUrl = process.env.INDEXNOW_SITE_URL ?? defaultSiteUrl;

  await writeIndexNowKeyFile(outputDirectory, key);
  const changedFiles = await getChangedFiles(
    process.env.GITHUB_EVENT_BEFORE,
    process.env.GITHUB_SHA
  );
  const candidates = getPostUrls(getAddedPostFiles(changedFiles), siteUrl);
  const urls = getIndexNowUrls(candidates, await getSitemapUrls(outputDirectory));

  await writeFile(manifest, `${JSON.stringify(urls)}\n`, "utf8");
  console.log(`Prepared ${urls.length} new IndexNow URL(s).`);
}

async function submit(manifest) {
  const urls = JSON.parse(await readFile(manifest, "utf8"));
  const response = await submitIndexNow({
    key: process.env.INDEXNOW_KEY,
    urls,
    siteUrl: process.env.INDEXNOW_SITE_URL ?? defaultSiteUrl,
  });

  console.log(response ? `IndexNow accepted ${urls.length} URL(s).` : "No new URLs to submit.");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, manifest = "indexnow-urls.json"] = process.argv.slice(2);

  if (command === "prepare") {
    await prepare();
  } else if (command === "submit") {
    await submit(manifest);
  } else {
    throw new Error("Usage: node scripts/indexnow.mjs <prepare|submit> [manifest]");
  }
}
