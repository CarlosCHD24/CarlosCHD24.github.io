import { lstat, readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const outputDirectory = resolve(process.cwd(), "out");
const maximumBytes = 12 * 1024 * 1024;
const canonicalOrigin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://jgarciasuarez.github.io",
).origin;
const siteIndexingEnabled =
  process.env.SITE_INDEXING?.trim().toLowerCase() === "true";
const socialImagePath = "/opengraph-image.png";
const socialImageAlt =
  "DDCF research network connecting computational friction, interface mechanics, and data-driven modeling.";
const expectedSameAs = [
  "https://jgarciasuarez.github.io/",
  "https://orcid.org/0000-0001-8830-4348",
  "https://github.com/jgarciasuarez",
  "https://x.com/jgs_research",
  "https://people.epfl.ch/joaquin.garciasuarez",
];

const requiredFiles = [
  "index.html",
  "404.html",
  "research/index.html",
  "teaching/index.html",
  "ddcf/index.html",
  "empleo-publico/index.html",
  "robots.txt",
  "sitemap.xml",
  "opengraph-image.png",
  "empleo-publico-og.png",
  "data/convocatorias.jsonl",
  "Joaquin_Garcia-Suarez_CV_May_2026.pdf",
  "images/DDCF_collage_corrected.webp",
  "images/contact_across_scales_corrected.webp",
  "images/portfolio_waves.webp",
];

const routeCanonicals = new Map([
  ["index.html", `${canonicalOrigin}/`],
  ["research/index.html", `${canonicalOrigin}/research/`],
  ["teaching/index.html", `${canonicalOrigin}/teaching/`],
  ["ddcf/index.html", `${canonicalOrigin}/ddcf/`],
  ["empleo-publico/index.html", `${canonicalOrigin}/empleo-publico/`],
]);

const routeSocialMetadata = new Map([
  [
    "index.html",
    {
      title: "Joaquin Garcia-Suarez | Data-Driven Computational Friction",
      description:
        "Academic portfolio and interactive DDCF research hub connecting friction physics, data-driven mechanics, and multiscale simulation.",
    },
  ],
  [
    "research/index.html",
    {
      title: "Research Portfolio | Joaquin Garcia-Suarez",
      description:
        "Research spanning interface mechanics, wave propagation in heterogeneous media, and computational methods.",
    },
  ],
  [
    "teaching/index.html",
    {
      title: "Teaching Portfolio | Joaquin Garcia-Suarez",
      description:
        "Teaching philosophy, mentoring experience, and proposed graduate classes.",
    },
  ],
  [
    "ddcf/index.html",
    {
      title: "DDCF | Data-Driven Computational Friction",
      description:
        "Explore the SNSF Ambizione project connecting data-driven constitutive modeling, neural operators, GPU acceleration, and automatic differentiation.",
    },
  ],
  [
    "empleo-publico/index.html",
    {
      title: "Empleo público en Sevilla | Visor de oportunidades",
      description:
        "Consulta y filtra convocatorias, bolsas y procesos de provisión de empleo público en Sevilla y su provincia.",
      locale: "es_ES",
      imagePath: "/empleo-publico-og.png",
      imageAlt:
        "Visor de oportunidades de empleo público en Sevilla con tabla, filtros y métricas.",
    },
  ],
]);

const forbiddenFiles = [
  "file.svg",
  "globe.svg",
  "next.svg",
  "vercel.svg",
  "window.svg",
  "og.png",
  "images/DDCF_collage_corrected.png",
  "images/contact_across_scales_corrected.png",
  "images/datasets.png",
  "images/portfolio_waves.png",
];

async function localReferenceExists(reference) {
  const pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  if (!pathname || pathname === "/") {
    return true;
  }

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
    if (details?.isFile()) {
      return true;
    }
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
    if (attributes[attribute] === value) {
      return attributes.content;
    }
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
  if (!match) {
    throw new Error(`JSON-LD is missing from ${routeFile}`);
  }

  const data = JSON.parse(match[1]);
  if (data["@context"] !== "https://schema.org" || !Array.isArray(data["@graph"])) {
    throw new Error(`JSON-LD context or graph is invalid in ${routeFile}`);
  }

  const website = data["@graph"].find((entry) => entry["@type"] === "WebSite");
  const person = data["@graph"].find((entry) => entry["@type"] === "Person");
  const rootUrl = `${canonicalOrigin}/`;

  if (
    website?.["@id"] !== `${canonicalOrigin}/#website` ||
    website?.url !== rootUrl ||
    website?.publisher?.["@id"] !== `${canonicalOrigin}/#person` ||
    website?.inLanguage !== "en"
  ) {
    throw new Error(`WebSite JSON-LD is invalid in ${routeFile}`);
  }

  if (
    person?.["@id"] !== `${canonicalOrigin}/#person` ||
    person?.name !== "Joaquin Garcia-Suarez" ||
    person?.url !== rootUrl ||
    person?.email !== "mailto:joaquin.garciasuarez@epfl.ch" ||
    person?.jobTitle !== "SNSF Ambizione Fellow" ||
    person?.worksFor?.name !== "EPFL" ||
    person?.worksFor?.url !== "https://www.epfl.ch/" ||
    JSON.stringify(person?.sameAs) !== JSON.stringify(expectedSameAs)
  ) {
    throw new Error(`Person JSON-LD or verified personal data is invalid in ${routeFile}`);
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
      throw new Error(`Symbolic links are not allowed in the Pages artifact: ${relative(outputDirectory, filePath)}`);
    }

    if (details.isDirectory()) {
      const nested = await inspectDirectory(filePath);
      bytes += nested.bytes;
      files += nested.files;
      bundledFontFound ||= nested.bundledFontFound;
      continue;
    }

    bytes += details.size;
    files += 1;
    bundledFontFound ||= entry.name.endsWith(".woff2");
  }

  return { bytes, files, bundledFontFound };
}

for (const requiredFile of requiredFiles) {
  const details = await lstat(join(outputDirectory, requiredFile)).catch(() => null);
  if (!details?.isFile()) {
    throw new Error(`Required export file is missing: ${requiredFile}`);
  }
}

for (const forbiddenFile of forbiddenFiles) {
  const details = await lstat(join(outputDirectory, forbiddenFile)).catch(() => null);
  if (details) {
    throw new Error(`Unused or legacy asset leaked into the export: ${forbiddenFile}`);
  }
}

for (const [routeFile, canonicalUrl] of routeCanonicals) {
  const html = await readFile(join(outputDirectory, routeFile), "utf8");
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

  const social = routeSocialMetadata.get(routeFile);
  const routeLocale = social.locale || "en_US";
  const routeImagePath = social.imagePath || socialImagePath;
  const routeImageAlt = social.imageAlt || socialImageAlt;
  requireMeta(html, routeFile, "property", "og:title", social.title);
  requireMeta(html, routeFile, "property", "og:description", social.description);
  requireMeta(html, routeFile, "property", "og:url", canonicalUrl);
  requireMeta(html, routeFile, "property", "og:site_name", "Joaquin Garcia-Suarez");
  requireMeta(html, routeFile, "property", "og:locale", routeLocale);
  requireMeta(html, routeFile, "property", "og:type", "website");
  requireMeta(html, routeFile, "property", "og:image:width", "1536");
  requireMeta(html, routeFile, "property", "og:image:height", "1024");
  requireMeta(html, routeFile, "property", "og:image:alt", routeImageAlt);
  requireMeta(html, routeFile, "name", "twitter:card", "summary_large_image");
  requireMeta(html, routeFile, "name", "twitter:title", social.title);
  requireMeta(html, routeFile, "name", "twitter:description", social.description);
  requireMeta(html, routeFile, "name", "twitter:image:alt", routeImageAlt);

  for (const [attribute, name] of [
    ["property", "og:image"],
    ["name", "twitter:image"],
  ]) {
    const imageUrl = getMetaContent(html, attribute, name);
    if (!imageUrl?.startsWith(`${canonicalOrigin}${routeImagePath}`)) {
      throw new Error(`${routeFile} has an invalid ${name} URL: ${imageUrl ?? "missing"}`);
    }
  }

  const robotsMeta = getMetaContent(html, "name", "robots");
  const expectedRobots = siteIndexingEnabled ? "index, follow" : "noindex, nofollow";
  if (robotsMeta !== expectedRobots) {
    throw new Error(
      `${routeFile} has invalid robots metadata: expected ${expectedRobots}, received ${robotsMeta ?? "missing"}`,
    );
  }

  validateStructuredData(html, routeFile);

  const references = html.matchAll(/(?:href|src)="([^"]+)"/g);
  for (const [, reference] of references) {
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

for (const imageName of ["opengraph-image.png", "empleo-publico-og.png"]) {
  const image = await readFile(join(outputDirectory, imageName));
  if (
    image.toString("ascii", 1, 4) !== "PNG" ||
    image.readUInt32BE(16) !== 1536 ||
    image.readUInt32BE(20) !== 1024
  ) {
    throw new Error(`${imageName} must be a validated 1536 × 1024 PNG asset`);
  }
}

const datasetText = await readFile(join(outputDirectory, "data/convocatorias.jsonl"), "utf8");
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
  datasetRecords.filter((record) => record.analysis?.status === "NEEDS_REVIEW").length !== 12
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
    throw new Error("Indexable robots.txt does not allow crawling or reference the sitemap");
  }
} else if (!robots.includes("Disallow: /") || robots.includes("Sitemap:")) {
  throw new Error("Staging robots.txt must block crawling and omit the sitemap declaration");
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
