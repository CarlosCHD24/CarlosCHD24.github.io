# Frontend Agent Instructions

## Technical constraints

1. Use Next.js App Router, React, TypeScript, CSS Modules, and `src/app/globals.css`.
2. Preserve the static export generated in `out/` and GitHub Pages compatibility.
3. Keep visible facts traceable to `../context-in-text/empleo_publico_visor.md`.
4. Record material changes and validation in `../projectProgressControl.md`.
5. Do not add personal portfolio content, personal names, profiles, CVs, or unrelated routes.

## Current product

- `/` and `/empleo-publico/` expose the public-employment explorer.
- The visitor-facing dataset is `public/data/convocatorias.jsonl`.
- Intent-based views, derived lifecycle/audience, visible deadlines, advanced filters, sorting, pagination,
  accessible table markup, and official-source details are implemented.
- GitHub Actions validates and publishes the static site.

## Delivery rules

- Run lint, component tests, the production build, export validation, and browser tests for production changes.
- Keep only visitor-facing assets in `public/`.
- Preserve the distinction between missing, unknown, and unstated dataset values.
