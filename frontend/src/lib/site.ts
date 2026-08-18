const canonicalFallback = "https://carloschd24.github.io";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || canonicalFallback,
);

export const siteIndexingEnabled =
  process.env.SITE_INDEXING?.trim().toLowerCase() === "true";

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}
