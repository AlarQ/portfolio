# PRD - route-migration (pack 2: migrate live routes to the design system, remove MUI)

## Problem

Pack 1 (`specs/design-system/`) delivered the complete Figma "MetaBlog" component library - `ui/` atoms, `ds/` organisms, and `pages/{Home,SinglePost,Author}` compositions - verified in Storybook with light + dark semantic tokens. But it deliberately stopped short of the app: every live route (`/`→`/blog` redirect, `/blog`, `/blog/[slug]`) still renders the old MUI 7 + Emotion dark surface. The repo now pays for two styling runtimes, two component families for the same concepts (two `PostCard`s, two headers), a `brand` hex seam that coexists with the token layer, and coexistence tooling (`@layer mui`, cascade-tie fixtures/tests) whose only purpose is to keep the halves from fighting. Until the routes migrate, the design system delivers zero user-visible value and the MUI/Emotion dependency tree (6 packages, plus framer-motion and two fonts used only by legacy components) cannot be removed.

## User & Value

- **Site readers** get the Figma light blog experience on the live site - the design that so far exists only in Storybook - with a working light/dark toggle, and keep every reading affordance they have today (ToC, prev/next, anchor links, highlighted code, callouts, diagrams).
- **The owner** gets a single component family, a single token source of truth, a smaller dependency tree and bundle (MUI + Emotion + framer-motion gone), and a codebase where the Storybook contract and the live site can no longer drift.

## Scope

### In

- Wire `pages/Home` as the blog index served at `/`; `/blog` permanently redirects to `/`; Post URLs stay `/blog/[slug]` (RSS untouched).
- Wire `pages/SinglePost` at `/blog/[slug]`, keeping the existing single-slug-gate MDX loading.
- New `/author` route rendering `pages/Author`, identity sourced from `src/data/profile.ts` instead of the current hardcode; nav link added.
- Port the reading features the Figma frames lack into new `ds/` components with stories (Storybook-first, per CLAUDE.md): Table of Contents, prev/next Post navigation, heading anchors - restyled on semantic tokens, preserving existing e2e accessibility contracts (aria names, `#mobile-menu`, rehype-slug heading ids).
- Rewrite the MDX presentation seam (`mdxPresentationBlock/Text`, `Callout`) from MUI `sx` to token-bound Tailwind, keeping the trust-boundary neutralizers verbatim (see ADR-0001 and the CLAUDE.md MDX trust boundary).
- Extend the Post model with optional `coverImage` + `categories` frontmatter, validated in the loader; `PostCard`/`SinglePost` degrade gracefully when absent.
- Replace root layout chrome: `ds/Header` + `ds/Footer` in `layout.tsx`; `ThemeProvider` reduced to next-themes only; `ThemePill` wired to `setTheme` (light default).
- Relocate the shiki `--shiki-*` palette out of `theme/theme.ts` so build-time code highlighting survives its deletion.
- Delete the entire legacy surface: MUI root components (incl. the dead portfolio cluster - Hero/Skills/Projects/Reading/Topic/sidebar and their data modules + presentation seams), `navigation/*`, `theme/theme.ts` + `theme/layout.ts`, coexistence fixtures and their tests/e2e.
- Remove dependencies: `@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`, `@emotion/react`, `@emotion/styled`, `@emotion/cache`, `framer-motion` (legacy-only consumers); drop Orbitron + Geist(sans) fonts.
- Update the affected test surfaces (unit + chromium e2e stay the gate) and stale docs (CLAUDE.md coexistence notes, CONTEXT.md if touched).

### Out

- Any new portfolio surfaces (projects, skills, reading) - dead code is deleted, not redesigned; no Figma equivalent exists. The **Project** surface (Project Brief, MVP Progress - still live in `CONTEXT.md`) is **deferred, not dropped**: it returns as its own spec in a later pack. This pack removes only the orphaned MUI cluster.
- Newsletter backend - the `Newsletter` organism renders; no signup service is wired.
- Deploying Storybook to production (unchanged from pack 1).
- Changing MDX authoring pipeline, mermaid prerendering, or the RSS feed beyond URL-neutral edits.
- `features/PRD-github-contributions.md` (unrelated).

## Decisions Captured

- **D-1** - Keep all post-page reading features (ToC, prev/next, anchors), rebuilt as storied `ds/` components on semantic tokens; drop nothing the live blog has today.
- **D-2** - Post model gains optional `coverImage` + `categories` in MDX frontmatter; loader validates; graceful degradation when absent (no fixture stand-ins in production).
- **D-3** - IA: blog index serves at `/`; `/`→`/blog` redirect inverted to `/blog`→`/` (permanent); Post URLs remain `/blog/[slug]`.
- **D-4** - `/author` route ships this pack; author identity becomes data-driven via `src/data/profile.ts`.
- **D-5** - Theming: light default, interactive toggle by wiring `ThemePill` to next-themes `setTheme`; dark palette already token-complete.
- **D-6** - Full deletion this pack: all MUI/Emotion packages and every legacy component, including the unreachable portfolio cluster and the ADR-DS-2 coexistence tooling (obsolete by design once MUI is gone).
- **D-7** - MDX trust boundary unchanged (see ADR-0001): script/iframe neutralizers and the single slug-validation gate survive the seam rewrite verbatim.
- **D-8** - Each route migrates fully in one pass (no mixed MUI+Tailwind routes), per the pack-1 PRD's migration-strategy note.
- **D-9** - The shiki CSS-var palette is retained but re-homed from `theme/theme.ts` `brand` into the token layer; `shikiVars.test.ts` repointed, not deleted.

## Open Questions for /propose

- **Tailwind preflight**: re-enable now that MUI `CssBaseline` is gone, or keep the hand-rolled `@layer base` reset in `globals.css`? (postcss/ADR-DS-2 rationale inverts.)
- **Shiki in light mode**: today's `--shiki-*` values are one dark-derived set; with a light default theme, do code blocks stay dark islands (common blog pattern) or need a light variant keyed off `.dark`?
- **Mono font for code**: keep the `--font-geist-mono` next/font variable or introduce a font token in `tokens.ts`?
- **Category vocabulary**: which category labels map to the 8 `BadgeCategory` hues, and is the mapping data or frontmatter-free-form?
- **e2e color assertions**: `blog-mdx-mapping.spec.ts` pins MUI-era rgb values - replace with new-token expectations or restate as token-resolution assertions?
- **Pagination reality**: one published Post today - does `Pagination` render at n=1, and is real page routing (`?page=`) in scope or is it presentational until post count demands it?

## Agent Insights (Explore Phase)

_Advisory - from three read-only Explore agents (legacy surface, DS readiness, infra impact)._

**Explore - legacy MUI surface:**
- 35 non-test files import `@mui/*`; Emotion is transitive only. `brand` in `theme/theme.ts` has 20 consumers and is the widest dependency - deletable only after navigation, root components, and 3 remaining presentation seams migrate.
- Orphan cluster already dead: `ProjectCard`, `ProjectDetailPanel`, `ProjectSidebar`, `sidebar/*` have no consumers and no route; `src/app/page.tsx` is unreachable behind the `/`→`/blog` redirect.
- `mdxPresentationBlock/Text` + `Callout` are the MUI carriers inside the MDX pipeline; `mdxPresentation.tsx` (registry + security neutralizers) and `Diagram.tsx` are already MUI-free.

**Explore - DS route-readiness:**
- Every `ui/`/`ds/`/`pages/` component has a story; page compositions are typed against the real `Post`/`NavItem` models, so fixture→loader swap is type-safe.
- Biggest gap is the article body: `ArticleProse` is a slot - no DS MDX mapping, code-block, ToC, or prev/next equivalents exist yet. `PostLayout` contains no `Header`; routes/layout must compose it.
- Theming is route-ready (same `.dark`-class mechanism in app and Storybook); the only missing piece is an interactive toggle. Cover/categories on cards are hardcoded stand-ins because the Post model lacks the fields.

**Explore - infra/test impact:**
- Zero MUI-specific build config: removal = 6 packages + three provider/layout files + `@layer mui` and the hand-rolled reset in `globals.css`. New-stack deps are all present and exact-pinned (`depsPinned.test.ts` enforces pins - keep them exact when editing `package.json`).
- Obsolete by design: `coexistence.spec.ts` (its route-regression block is worth salvaging), `cascade-tie.spec.ts`, `theme/coexistence.test.ts`, `CascadeTieFixtureCard`. Contract-critical e2e to preserve: `navigation.spec.ts` aria-labels + `#mobile-menu`, ToC/anchor aria names and heading ids, `blog-security.spec.ts`.
- `shikiVars` must be re-homed before `theme.ts` dies or build-time highlighting and its pre-push gate break. Fonts converge on Inter (spec: no Work Sans); pre-push runs lint + type-check + vitest + audit, so mid-migration states must keep unit tests green.
