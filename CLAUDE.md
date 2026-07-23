# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site. Next.js 16 (App Router, SSG) + React 19 + Tailwind/shadcn, TypeScript strict. Content is self-authored static data - there is **no CMS, no database, no external input**.

There **is** a **Blog** of **Posts**: long-form prose authored as MDX files under `content/posts/`, rendered statically at build time (see [ADR-0001](docs/adr/0001-mdx-for-blog-posts.md) and the **Post**/**Blog** glossary in `CONTEXT.md`). Routes are `/`, `/projects`, `/blog`, and `/blog/[slug]`. The `README.md` is stale (it predates the real build and may describe a different model) - trust `CONTEXT.md`, the ADRs, and the code, not the README.

### MDX trust boundary (security)

The MDX render pipeline renders raw HTML/JSX from Post bodies **as trusted content, and that trust is load-bearing**. It holds ONLY while every Post is **100% owner-authored**. The rationale and "single slug-validation gate" seam are recorded in `CONTEXT.md` (2026-06-09 build decision) and [ADR-0001](docs/adr/0001-mdx-for-blog-posts.md); the slice's security scenarios live in the blog `spec.md` (FR-5). Concretely:

- **Slug safety** is enforced in exactly one place - the loader's pure core `buildPostSet` in `src/data/postLoader.ts` validates every candidate against `^[a-z0-9-]+$` (skip + build warning) and never joins arbitrary input to the filesystem. `generateStaticParams` (`src/app/blog/[slug]/page.tsx`) only *maps* that already-validated set and re-validates nothing.
- **MDX body hardening** lives at the presentation seam (`src/utils/mdxPresentation.tsx`): external links carry `rel="noopener noreferrer"`, and `<script>`/`<iframe>` are mapped to no-render neutralizers so a body cannot embed live third-party active content. Active-content neutralization is belt-and-suspenders across two seams: the component map here catches Markdown/hast elements, and the `rehypeNeutralizeActiveContent` AST plugin (wired in `next.config.ts`) strips `<script>`/`<iframe>` authored as explicit JSX, which bypasses the component map.
- **If this ever changes** - accepting any external, PR-submitted, or otherwise untrusted MDX - the trust assumption breaks (Elevation of Privilege). Before merging such a change you MUST introduce `rehype-sanitize` in the MDX pipeline **and** a Content-Security-Policy. Do not relax the "owner-authored only" rule without both.

## Commands

```bash
pnpm dev            # dev server, http://localhost:3000
pnpm build          # production build (SSG)
pnpm lint           # biome check (lint)
pnpm lint:fix       # biome check --write
pnpm format         # biome format --write
pnpm type-check     # tsc --noEmit  (run this - biome does not type-check)

pnpm test:e2e                          # all Playwright e2e
pnpm exec playwright test e2e/home.spec.ts      # single file
pnpm exec playwright test --project=chromium    # single browser (chromium|firefox|webkit|"Mobile Chrome"|"Mobile Safari")
pnpm test:e2e:ui                       # interactive UI mode
```

Tooling is **Biome**, not ESLint/Prettier. `noExplicitAny`, `noUnusedVariables`, `noUnusedImports` are errors. Commits go through Husky + commitlint (Conventional Commits); releases via `pnpm release` (commit-and-tag-version).

## Architecture - the seam pattern

This is the core idea the codebase is organized around. A domain concept flows through three layers, each a separate module:

```
src/data/*.ts          domain data + types - NO JSX, NO colors-as-literals, NO icons
   ↓
src/utils/*Presentation.tsx   "presentation seam" - resolves data → icons/colors/JSX
   ↓
src/components/*.tsx    components - consume presentation output, never reach past it
```

Rules that keep this honest:

### Design tokens

`src/theme/tokens.ts` is the token source of truth for the shadcn/`ui`-`ds`-`pages` surface, two layers:

- **Primitives** (`primitives`, `dimensionPrimitives`) - raw values (hex, px). `primitives` is the only file where hex literals live.
- **Semantic aliases** (`semanticLight`/`semanticDark`, `semanticDimensions`) - each alias resolves to a primitive NAME, never an inline value; `satisfies Record<string, PrimitiveName>` makes an unbacked alias a **compile error**, not a runtime gap. Dimension tokens follow the identical pattern for spacing/radius/container sizes.

Components bind **only** the semantic layer via Tailwind utilities (`bg-background`, `max-w-content`, `rounded-pill`, …) - never hex/rgb/hsl/oklch literals, never `primitives`/`dimensionPrimitives` imports, never Tailwind arbitrary-value colors (`bg-[#...]`). All lint-enforced by `grit/no-direct-palette-import.grit` via `pnpm lint` (arbitrary non-color values like `w-[80%]` or `text-[clamp(...)]` are unrestricted).

`tokens.css` is `@generated` by `pnpm generate:tokens` - **never hand-edit it**; change `tokens.ts` and regenerate. A freshness test in `tokens.test.ts` fails pre-push if the committed CSS has drifted from the source maps.

- **Presentation seams own all icon/color resolution.** E.g. `skillPresentation.tsx` maps a `SkillLevel` → its `{ label, category }` (Badge hue) via an exhaustive `Record<SkillLevel, ...>`, and `projectPresentation.tsx` maps a `Status`/`TechKey` → tone/hue the same way. A missing entry is a **compile error**, not a runtime gap. Components ask the seam, never resolve colors/icons themselves.
- **`src/data/domains.ts` is the home of the Domain Area concept.** A Domain Area is evidenced by Achievements and rated by Skills (two views, one area - see `CONTEXT.md`). Adding/renaming an area is one edit here - no parallel arrays, no new props threaded through `page.tsx`. Avoid reintroducing parallel `leadershipX`/`technicalX` arrays at the call site.

When adding a domain concept, follow this layering: type+data in `src/data/`, any icon/color/JSX resolution in a `*Presentation` seam, rendering in a component. Don't put hex or JSX in data modules; don't resolve icons inside components.

`CONTEXT.md` is the domain glossary (Project, MVP Progress, Domain Area, Achievement, Skill, Reading, Topic) with the precise meaning of each term and deliberately-rejected synonyms. Read it before naming anything.

### Diagrams

Every Mermaid diagram (`content/diagrams/*.mmd`) uses the **one** palette owned by `scripts/prerender-mermaid.ts` - category Badge hues in light, Shiki token colors in dark, resolved from `src/theme/tokens.ts` primitives (same seam pattern as Design tokens above). A `.mmd` declares structure + a semantic role per node (`class x plan`) and never a color literal; `classDef`/`style` lines are stripped if present. Do not introduce a second palette, inline `classDef` colors, or a one-off style for a single diagram (including Project Briefs) - add a new role to `LIGHT_ROLES`/`DARK_ROLES` in that script if an existing hue doesn't fit, then re-run `pnpm prerender:mermaid`. Render with `<Diagram name="..." alt="..." />` (`src/components/Diagram.tsx`), never `rehype-mermaid` at build time (breaks the Vercel image, see the script's header comment).

## Component workflow - Storybook first

Every visual component is developed and verified in Storybook **before** it is wired into an app route. Order is mandatory, not advisory:

1. **Build the component + its story together.** A new component under `src/components/ui/`, `src/components/ds/`, or `src/components/pages/` is not done until a sibling `*.stories.tsx` exists covering its meaningful states (variants, empty, long-content, and light + dark via the theme toggle).
2. **Verify in Storybook** (`pnpm storybook`, port 6006) - check the a11y addon panel and both themes - before any page integration.
3. **Only then** consume it from `src/app/` routes.

Rules that keep this honest:

- **No story, no page usage.** Do not import a `ui/` or `ds/` component into a route unless its `*.stories.tsx` exists. `pnpm lint:stories` (also run by the pre-commit hook) fails the commit if any component in the storied tiers lacks a sibling story.
- **Changing a component's props/variants/visual states updates its story in the same commit.** Stories are the component's contract; a stale story is a broken contract.
- **Stories stay page-agnostic.** No app-route imports, no Next.js router dependencies inside `ui/`/`ds/` stories; needed data comes from local fixtures (see `src/components/storybook-fixtures/`).
- **Page-level stories** (`src/components/pages/*.stories.tsx`) compose already-storied components - they are integration views, not the place to first exercise a new component.
- Follow the existing taxonomy: `Atoms/…` (`ui/` primitives), `Molecules/…` and `Organisms/…` (`ds/` composites), `Pages/…` (full pages), `Internal/…` (Storybook-only fixtures). Don't invent new top-level categories.

## Notes

- `src/components/ds/AreaHeadlineCard.tsx` renders a **Domain Area**'s headline card (stating the area's offering), driven by `DomainArea.headline`; `src/components/ds/DomainAreaPanel.tsx` composes it with the area's Achievements and rated Skills on `/author`. The old `ServiceCard`/`serviceTitle` naming is gone - "Service" was never a domain concept.
- `reports/` holds architecture-audit findings (some marked RESOLVED); `docs/testing.md` is the Playwright guide; `features/` holds PRDs for unbuilt work.
- e2e runs three Playwright projects (chromium, firefox, Mobile Chrome) and the full suite is green; blog specs assert real `content/posts/` content, so re-check them when Posts are added, removed, or re-titled.
