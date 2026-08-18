# App Router Instructions

## Directives

1. Define routes with `page.tsx` files and shared UI with `layout.tsx`.
2. Preserve the root Navigation, main-content landmark, Footer, skip link, metadata, and structured data.
3. Keep every route statically exportable; do not introduce request-time server features.
4. Use route metadata and the helpers in `src/lib/site.ts` for canonical URLs.
5. Source factual copy from the repository-level `context-in-text/` files documented in
   `../../../projectProgressControl.md`.

## Implemented routes

| Route | Purpose | Status |
|---|---|---|
| `/` | Biography, evidence, metrics, research preview, education, and collaboration | Complete |
| `/research` | Three research themes, current directions, foundation, recognition, and publications | Complete |
| `/teaching` | Philosophy, methods, experience, mentoring evidence, and proposed courses | Complete |
| `/ddcf` | Interactive Data-Driven Computational Friction project hub | Complete |
| `/empleo-publico` | Spanish read-only explorer for the consolidated public-employment JSONL | Complete |

## Generated resources

- `/robots.txt` from `robots.ts`.
- `/sitemap.xml` from `sitemap.ts`.
- `/opengraph-image.png` from the route image file.
- `/404.html` through static export.

All four routes, generated resources, canonical URLs, and the export size are checked by
`scripts/validate-static-export.mjs`.
