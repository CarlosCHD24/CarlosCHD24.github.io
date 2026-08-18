import { appendFile, readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const outputDirectory = resolve(process.cwd(), "out");
const timeoutMilliseconds = 15_000;
const restrictedStatuses = new Set([401, 403, 429]);
const siteOrigin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://carloschd24.github.io",
).origin;

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(path)));
    } else if (entry.name.endsWith(".html")) {
      files.push(path);
    }
  }

  return files;
}

const urls = new Set();
for (const file of await collectHtmlFiles(outputDirectory)) {
  const html = await readFile(file, "utf8");
  for (const [, rawReference] of html.matchAll(/href="([^"]+)"/g)) {
    const reference = rawReference.replaceAll("&amp;", "&");
    if (!/^https?:\/\//i.test(reference)) continue;
    const url = new URL(reference);
    if (url.origin === siteOrigin) continue;
    urls.add(url.toString());
  }
}

async function checkUrl(url) {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMilliseconds);

    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          Accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
          "User-Agent":
          "Mozilla/5.0 (compatible; EmpleoPublicoLinkCheck/1.0; +https://carloschd24.github.io/)",
        },
      });
      await response.body?.cancel();

      if (response.ok || (response.status >= 300 && response.status < 400)) {
        return { url, status: "ok", code: response.status };
      }
      if (restrictedStatuses.has(response.status)) {
        return { url, status: "restricted", code: response.status };
      }

      lastError = `HTTP ${response.status}`;
      if (response.status < 500 || attempt === 2) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt === 2) break;
    } finally {
      clearTimeout(timer);
    }
  }

  return { url, status: "failed", error: lastError ?? "Unknown error" };
}

const pending = [...urls];
const results = [];
const workers = Array.from({ length: Math.min(4, pending.length) }, async () => {
  while (pending.length > 0) {
    const url = pending.shift();
    if (url) results.push(await checkUrl(url));
  }
});
await Promise.all(workers);

results.sort((left, right) => left.url.localeCompare(right.url));
const failures = results.filter((result) => result.status === "failed");
const restricted = results.filter((result) => result.status === "restricted");

for (const result of failures) {
  console.error(`BROKEN ${result.url} (${result.error})`);
}
for (const result of restricted) {
  console.warn(`RESTRICTED ${result.url} (HTTP ${result.code}; link exists but blocks automation)`);
}

const summary = `External link check: ${results.length - failures.length - restricted.length} reachable, ${restricted.length} restricted, ${failures.length} broken.`;
console.log(summary);

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `### External links\n\n${summary}\n`);
}

if (failures.length > 0) {
  process.exitCode = 1;
}
