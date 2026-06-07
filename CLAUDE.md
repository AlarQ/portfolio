# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site. Next.js 16 (App Router, SSG) + React 19 + MUI 7, TypeScript strict. Content is self-authored static data — there is **no CMS, no database, no external input**.

> The `README.md` is stale: it describes an MDX/Velite blog and a `content/` directory that **do not exist**. Trust `CONTEXT.md` and the code, not the README. There is no blog. Routes are `/` and `/projects` only.

## Commands

```bash
npm run dev            # dev server, http://localhost:3000
npm run build          # production build (SSG)
npm run lint           # biome check (lint)
npm run lint:fix       # biome check --write
npm run format         # biome format --write
npm run type-check     # tsc --noEmit  (run this — biome does not type-check)

npm run test:e2e                          # all Playwright e2e
npx playwright test e2e/home.spec.ts      # single file
npx playwright test --project=chromium    # single browser (chromium|firefox|webkit|"Mobile Chrome"|"Mobile Safari")
npm run test:e2e:ui                       # interactive UI mode
```

Tooling is **Biome**, not ESLint/Prettier. `noExplicitAny`, `noUnusedVariables`, `noUnusedImports` are errors. Commits go through Husky + commitlint (Conventional Commits); releases via `npm run release` (commit-and-tag-version).

## Architecture — the seam pattern

This is the core idea the codebase is organized around. A domain concept flows through three layers, each a separate module:

```
src/data/*.ts          domain data + types — NO JSX, NO colors-as-literals, NO icons
   ↓
src/utils/*Presentation.tsx   "presentation seam" — resolves data → icons/colors/JSX
   ↓
src/components/*.tsx    MUI components — consume presentation output, never reach past it
```

Rules that keep this honest:

- **`src/theme/theme.ts` is the single brand-color seam.** Every named hue is a token on the exported `brand` object. Data and presentation modules import `brand.sky` etc.; they never re-type raw hex. Change a color in one place.
- **Presentation seams own all icon/color resolution.** E.g. `skillPresentation.tsx` maps an `IconKey` → a concrete MUI icon via an exhaustive `Record<IconKey, ...>`. A missing entry is a **compile error**, not a runtime gap. Components ask the seam, never the icon registry directly.
- **`src/data/domains.ts` is the home of the Domain Area concept.** A Domain Area is evidenced by Achievements and rated by Skills (two views, one area — see `CONTEXT.md`). Adding/renaming an area is one edit here — no parallel arrays, no new props threaded through `page.tsx`. Avoid reintroducing parallel `leadershipX`/`technicalX` arrays at the call site.

When adding a domain concept, follow this layering: type+data in `src/data/`, any icon/color/JSX resolution in a `*Presentation` seam, rendering in a component. Don't put hex or JSX in data modules; don't resolve icons inside components.

`CONTEXT.md` is the domain glossary (Project, MVP Progress, Domain Area, Achievement, Skill, Reading, Topic) with the precise meaning of each term and deliberately-rejected synonyms. Read it before naming anything.

## Notes

- `src/components/ServiceCard.tsx` is **dead code** — "Service" is not a domain concept. Don't build on it.
- `reports/` holds architecture-audit findings (some marked RESOLVED); `docs/testing.md` is the Playwright guide; `features/` holds PRDs for unbuilt work.
- e2e webkit/mobile suites have known pre-existing failures (profile-card heading mismatch); chromium is the reliable signal.
