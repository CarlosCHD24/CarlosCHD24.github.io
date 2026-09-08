# Project Progress Control

## Current verified product

- Static Next.js viewer for public-employment opportunities in Sevilla and its province.
- Public routes: `/` and `/empleo-publico/`.
- Dataset: 302 valid schema-v2 records through 8 September 2026 in `frontend/public/data/convocatorias.jsonl`.
- Features: diacritic-tolerant search, collapsible multi-select process/pool/status/access/source/review filters,
  one-click finished-process hiding, sorting, pagination, accessible table, expandable details, and official-source links.
- Publishing target: `https://carloschd24.github.io/` through GitHub Pages.

## Completed work

### 2026-08-18 — Employment viewer

- Added the master dataset and its documented presentation rules.
- Built the responsive Spanish viewer and route-specific social metadata.
- Added export, component, interaction, responsive, route, and accessibility checks.
- Published the viewer through the existing GitHub Pages workflow.

### 2026-08-18 — Finished-process control

- Added an independent, reversible button that hides the 25 `COMPLETED` records and leaves 211 visible results.
- Added active-state semantics and filter-reset support.
- Corrected component-test discovery so TypeScript helper tests execute.

### 2026-08-18 — Retired portfolio removal

- Removed the migrated portfolio routes, components, source documents, CV, images, personal metadata,
  profile links, tests, and hosting association.
- Made the employment viewer the site homepage while retaining `/empleo-publico/` as a stable alternate route.
- Replaced personal Person metadata with Spanish WebSite structured data.
- Restricted sitemap, export validation, responsive checks, and accessibility checks to the employment product.
- Added explicit checks that retired routes return 404 and old personal references cannot enter the static export.
- Validation completed before publication:
  - Repository reference scan: no previous personal names or profile links remain.
  - ESLint: passed with zero errors and zero warnings.
  - Component/helper tests: 5 passed.
  - Next.js production build and TypeScript: passed with only `/` and `/empleo-publico/` as content routes.
  - Static export: 42 files and 3.17 MiB; both indexable and noindex modes passed.
  - Security baseline: passed.
  - Browser interaction, responsive, retired-route, and WCAG A/AA checks: 16 passed.

### 2026-08-18 — Multiple-selection filters

- Replaced the single-choice process, pool, status, access, and source filters with accessible checkbox menus.
- Multiple values inside one category use OR semantics; active categories continue to combine with AND semantics.
- Moved the review-only choice into the multiple-selection status menu and added the previously omitted detected
  and unknown-access choices.
- Preserved text search, sorting, the quick finished-process toggle, and complete filter reset.
- Added helper and browser coverage for empty, single, and multiple selections.
- Validation completed before publication:
  - ESLint: passed with zero errors and zero warnings.
  - Component/helper tests: 7 passed.
  - Next.js production build, TypeScript, and static-export validation: passed.
  - Browser interaction, responsive, retired-route, and WCAG A/AA checks: 16 passed.

### 2026-08-18 — Collapsible filters and dataset footer

- Wrapped the complete filter area in an accessible disclosure that starts closed and reports the number of active criteria.
- Kept filter state and filtered results intact when the disclosure is closed and reopened.
- Moved the coverage and JSONL download card out of the hero and into a dedicated final page section.
- Validation completed before publication:
  - ESLint: passed with zero errors and zero warnings.
  - Component/helper tests: 7 passed.
  - Next.js production build, TypeScript, and static-export validation: passed (42 files, 3.18 MiB).
  - Browser interaction, responsive, retired-route, and WCAG A/AA checks: 16 passed.

### 2026-09-08 — Dataset update through 8 September

- Replaced the public master with 302 schema-v2 opportunities: all 236 previous IDs retained and 66 net new records added.
- Recorded the update report, source-coverage ledger, and eight documented incidences alongside the product context.
- Updated visitor-facing coverage, the sitemap date, dataset totals, and the dynamic “Todas” pagination option.
- Verified 20 open application processes, 103 confirmed pools, 29 active pools, 14 review records, and 31 completed processes.
- Preserved the coverage limitation that BOE was checked through 8 September while the latest located BOP Sevilla was 7 September.
- Validation completed before publication:
  - Dataset parsing and identity checks: 302 valid records, zero duplicate IDs, zero missing required presentation fields.
  - ESLint: passed with zero errors and zero warnings.
  - Component/helper tests: 7 passed.
  - Next.js production build, TypeScript, static-export validation, and reviewed security baseline: passed (42 files, 3.36 MiB).
