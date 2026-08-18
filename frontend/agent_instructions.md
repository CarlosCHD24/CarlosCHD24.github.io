# Frontend Agent Instructions

## Technical constraints

1. Use Next.js App Router, React, and TypeScript.
2. Use CSS Modules and `src/app/globals.css`; do not introduce Tailwind CSS.
3. Preserve static-export compatibility. Production output must be generated in `out/`.
4. Keep visible content traceable to the repository-level `context-in-text/` sources.
5. Record every material change and new task in `../projectProgressControl.md`.

## Source hierarchy

- `../context-in-text/CV_May_2026-1.md`: biography, dates, metrics, publications, teaching, and mentoring.
- `../context-in-text/research_statement_4_Carlson.md`: research narrative.
- `../context-in-text/teaching_statement_4_Carlson.md`: teaching narrative.
- `../context-in-text/goal.md`: product and design requirements.
- `../context-in-text/empleo_publico_visor.md`: verified dataset facts and presentation rules for the public-employment viewer.
- `../projectProgressControl.md`: verified implementation state, decisions, backlog, and validation.

Use only the verified sources listed above for portfolio content.

## Current state

- [x] Home/Bio route implemented.
- [x] Research route implemented.
- [x] Teaching route implemented.
- [x] Interactive DDCF React Flow hub implemented.
- [x] Public-employment JSONL viewer implemented at `/empleo-publico`.
- [x] Responsive navigation, accessibility, SEO, component tests, browser tests, and CI implemented.
- [x] GitHub Pages-compatible static export implemented.
- [!] GitHub Pages source switch requires repository-administrator permission.

## Delivery rules

- Run `npm run lint`, `npm run test:component`, `npm run test:e2e`, `npm run build`, and
  `npm run validate:export` for production-facing changes.
- Keep only visitor-facing files in `public/`; source and archival figures belong in the repository-level
  `context/` directories.
- Do not expose the submitted HyperMech proposal until its outcome or approved public wording is available.
