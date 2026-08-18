import { lstat, readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const outputDirectory = resolve(process.cwd(), "out");
const maximumBytes = 5 * 1024 * 1024;
const canonicalOrigin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://carloschd24.github.io",
).origin;
const siteIndexingEnabled =
  process.env.SITE_INDEXING?.trim().toLowerCase() === "true";
const pageTitle = "Empleo público en Sevilla | Visor de oportunidades";
const pageDescription =
  "Consulta y filtra convocatorias, bolsas y procesos de provisión de empleo público en Sevilla y su provincia.";
const socialImagePath = "/empleo-publico-og.png";
const socialImageAlt =
  "Visor de oportunidades de empleo público en Sevilla con tabla, filtros y métricas.";

const requiredFiles = [
  "index.html",
  "404.html",
  "empleo-publico/index.html",
  "robots.txt",
  "sitemap.xml",
  "empleo-publico-og.png",
  "data/convocatorias.jsonl",
];

const forbiddenPaths = [
  "research",
  "teaching",
  "ddcf",
  "images",
  "opengraph-image.png",
];

const routeCanonicals = new Map([
  ["index.html", `${canonicalOrigin}/`],
  ["empleo-publico/index.html", `${canonicalOrigin}/empleo-publico/`],
]);

async function localReferenceExists(reference) {
  const pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  if (!pathname || pathname === "/") return true;

  const relativePath = pathname.replace(/^\/+/, "");
  const candidates = relativePath.endsWith("/")
    ? [join(outputDirectory, relativePath, "index.html")]
    : [
        join(outputDirectory, relativePath),
        join(outputDirectory, relativePath, "index.html"),
        join(outputDirectory, `${relativePath}.html`),
      ];

  for (const candidate of candidates) {
    const details = await lstat(candidate).catch(() => null);
    if (details?.isFile()) return true;
  }
  return false;
}

function getMetaContent(html, attribute, value) {
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/g)) {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => [
        match[1],
        match[2],
      ]),
    );
    if (attributes[attribute] === value) return attributes.content;
  }
  return undefined;
}

function requireMeta(html, routeFile, attribute, name, expected) {
  const actual = getMetaContent(html, attribute, name);
  if (actual?.trim() !== expected) {
    throw new Error(
      `${routeFile} has invalid ${name}: expected ${expected}, received ${actual ?? "missing"}`,
    );
  }
}

function validateStructuredData(html, routeFile) {
  const match = html.match(
    /<script type="application\/ld\+json">([^<]+)<\/script>/,
  );
  if (!match) throw new Error(`JSON-LD is missing from ${routeFile}`);

  const data = JSON.parse(match[1]);
  if (
    data["@context"] !== "https://schema.org" ||
    data["@type"] !== "WebSite" ||
    data["@id"] !== `${canonicalOrigin}/#website` ||
    data.url !== `${canonicalOrigin}/` ||
    data.name !== "Oportunidades de empleo público en Sevilla" ||
    data.inLanguage !== "es"
  ) {
    throw new Error(`WebSite JSON-LD is invalid in ${routeFile}`);
  }
}

async function inspectDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  let bytes = 0;
  let files = 0;
  let bundledFontFound = false;

  for (const entry of entries) {
    const filePath = join(directory, entry.name);
    const details = await lstat(filePath);
    if (details.isSymbolicLink()) {
      throw new Error(
        `Symbolic links are not allowed: ${relative(outputDirectory, filePath)}`,
      );
    }
    if (details.isDirectory()) {
      const nested = await inspectDirectory(filePath);
      bytes += nested.bytes;
      files += nested.files;
      bundledFontFound ||= nested.bundledFontFound;
    } else {
      bytes += details.size;
      files += 1;
      bundledFontFound ||= entry.name.endsWith(".woff2");
    }
  }

  return { bytes, files, bundledFontFound };
}

for (const requiredFile of requiredFiles) {
  const details = await lstat(join(outputDirectory, requiredFile)).catch(() => null);
  if (!details?.isFile()) {
    throw new Error(`Required export file is missing: ${requiredFile}`);
  }
}

for (const forbiddenPath of forbiddenPaths) {
  if (await lstat(join(outputDirectory, forbiddenPath)).catch(() => null)) {
    throw new Error(`Retired portfolio content leaked into the export: ${forbiddenPath}`);
  }
}

for (const [routeFile, canonicalUrl] of routeCanonicals) {
  const html = await readFile(join(outputDirectory, routeFile), "utf8");
  const forbiddenReference = [
    /"@type":"Person"/i,
    /mailto:/i,
  ].find((pattern) => pattern.test(html));
  if (forbiddenReference) {
    throw new Error(
      `Retired portfolio reference ${forbiddenReference} found in ${routeFile}`,
    );
  }
  if (!html.includes(canonicalUrl)) {
    throw new Error(`Canonical URL ${canonicalUrl} is missing from ${routeFile}`);
  }
  if (siteIndexingEnabled && html.includes('content="noindex, nofollow"')) {
    throw new Error(`Indexable export contains noindex metadata in ${routeFile}`);
  }
  if (!siteIndexingEnabled && !html.includes('content="noindex, nofollow"')) {
    throw new Error(`Staging export is missing noindex metadata in ${routeFile}`);
  }
  if (html.includes("fonts.googleapis.com") || html.includes("fonts.gstatic.com")) {
    throw new Error(`External Google Fonts dependency found in ${routeFile}`);
  }

  requireMeta(html, routeFile, "property", "og:title", pageTitle);
  requireMeta(html, routeFile, "property", "og:description", pageDescription);
  requireMeta(html, routeFile, "property", "og:url", canonicalUrl);
  requireMeta(html, routeFile, "property", "og:site_name", "Empleo público · Sevilla");
  requireMeta(html, routeFile, "property", "og:locale", "es_ES");
  requireMeta(html, routeFile, "property", "og:type", "website");
  requireMeta(html, routeFile, "property", "og:image:width", "1536");
  requireMeta(html, routeFile, "property", "og:image:height", "1024");
  requireMeta(html, routeFile, "property", "og:image:alt", socialImageAlt);
  requireMeta(html, routeFile, "name", "twitter:card", "summary_large_image");
  requireMeta(html, routeFile, "name", "twitter:title", pageTitle);
  requireMeta(html, routeFile, "name", "twitter:description", pageDescription);
  requireMeta(html, routeFile, "name", "twitter:image:alt", socialImageAlt);

  for (const [attribute, name] of [
    ["property", "og:image"],
    ["name", "twitter:image"],
  ]) {
    const imageUrl = getMetaContent(html, attribute, name);
    if (!imageUrl?.startsWith(`${canonicalOrigin}${socialImagePath}`)) {
      throw new Error(`${routeFile} has an invalid ${name} URL`);
    }
  }

  const expectedRobots = siteIndexingEnabled ? "index, follow" : "noindex, nofollow";
  requireMeta(html, routeFile, "name", "robots", expectedRobots);
  validateStructuredData(html, routeFile);

  for (const [, reference] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (
      reference.startsWith("#") ||
      reference.startsWith("//") ||
      /^[a-z][a-z\d+.-]*:/i.test(reference)
    ) {
      continue;
    }
    if (!(await localReferenceExists(reference))) {
      throw new Error(`Broken local reference in ${routeFile}: ${reference}`);
    }
  }
}

const image = await readFile(join(outputDirectory, "empleo-publico-og.png"));
if (
  image.toString("ascii", 1, 4) !== "PNG" ||
  image.readUInt32BE(16) !== 1536 ||
  image.readUInt32BE(20) !== 1024
) {
  throw new Error("empleo-publico-og.png must be a validated 1536 × 1024 PNG");
}

const datasetText = await readFile(
  join(outputDirectory, "data/convocatorias.jsonl"),
  "utf8",
);
const datasetRecords = datasetText
  .split("\n")
  .filter((line) => line.trim())
  .map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`Invalid JSONL at line ${index + 1}: ${error.message}`);
    }
  });
if (
  datasetRecords.length !== 236 ||
  datasetRecords.some((record) => record.schema_version !== 2) ||
  datasetRecords.filter((record) => record.pool?.existence === "YES").length !== 83 ||
  datasetRecords.filter((record) => record.analysis?.status === "NEEDS_REVIEW").length !== 12 ||
  datasetRecords.filter((record) => record.process_stage === "COMPLETED").length !== 25
) {
  throw new Error("Employment dataset totals or schema do not match the validated master");
}

const sitemap = await readFile(join(outputDirectory, "sitemap.xml"), "utf8");
for (const canonicalUrl of routeCanonicals.values()) {
  if (!sitemap.includes(canonicalUrl)) {
    throw new Error(`Sitemap is missing ${canonicalUrl}`);
  }
}

const robots = await readFile(join(outputDirectory, "robots.txt"), "utf8");
if (siteIndexingEnabled) {
  if (!robots.includes("Allow: /") || !robots.includes(`${canonicalOrigin}/sitemap.xml`)) {
    throw new Error("Indexable robots.txt is invalid");
  }
} else if (!robots.includes("Disallow: /") || robots.includes("Sitemap:")) {
  throw new Error("Staging robots.txt must block crawling and omit the sitemap");
}

const result = await inspectDirectory(outputDirectory);
if (!result.bundledFontFound) {
  throw new Error("The self-hosted Inter WOFF2 file is missing from the export");
}
if (result.bytes > maximumBytes) {
  throw new Error(
    `Static export is ${(result.bytes / 1024 / 1024).toFixed(2)} MiB; budget is ${(maximumBytes / 1024 / 1024).toFixed(0)} MiB`,
  );
}

console.log(
  `Static export validated for ${canonicalOrigin} (${siteIndexingEnabled ? "indexable" : "noindex"}): ${result.files} files, ${(result.bytes / 1024 / 1024).toFixed(2)} MiB`,
);
