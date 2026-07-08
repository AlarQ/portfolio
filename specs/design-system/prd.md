# PRD — `design-system`

> First pack of a phased **MUI 7 → shadcn/ui** re-platform. Stands up a
> shadcn/ui + Storybook component workshop that adopts the Figma "The Blog"
> blog template's visual language. Live app pages stay on MUI until later packs
> migrate them route-by-route.
>
> Source design: Figma "The Blog — A Web Personal Blog & Community"
> (`X9uhhLY25UKL1Eh5vpWOFa`), root node `614:352` "The Blog" (node-id `614-1928`
> in the original share link) and the full `• Design` page.
> Explore phase: 2026-07-04.

## Problem

The site is a personal portfolio built on **MUI 7 + Emotion** (runtime CSS-in-JS,
dark "cyber" palette). The owner wants to re-platform onto **shadcn/ui** (Tailwind
v4 + Radix) and adopt a light Figma blog-template visual language. Migrating live
routes directly is high-risk: styling foundation, component library, and visual
language would all change at once on production pages, with no isolated surface to
build and visually review the new component system before it touches live routes.

## User & Value

Beneficiary: the **site owner** (solo dev). Value: a token-driven,
framework-agnostic shadcn/ui component library documented in a **Storybook**
visual-review surface, built in isolation — de-risking the full MUI→shadcn
migration by proving the design system before migrating any route.

## Scope

### In

- **Tooling** — Tailwind v4 via `@tailwindcss/postcss` (**preflight disabled** so
  MUI `CssBaseline` stays authoritative during coexistence), `shadcn init`,
  Storybook 9, `next-themes` (`class` strategy) registering `light` + `dark`.
- **Token layer — TS-authored, CSS-generated (D-6)** — `src/theme/tokens.ts`
  (two-layer: primitive palette → semantic shadcn-role aliases) is the single
  source of truth; a `generate:tokens` script emits an `@generated` `tokens.css`.
  Components reference **only** the semantic layer — no raw hex, no `--brand-*`
  primitive, no `palette.*`. (Authoring mechanics, `@import` ordering, `@theme
  inline` bridge → `design.md`.)
- **Components** — Figma atomic-design set. Reuse + restyle shadcn primitives
  (`badge`, `button`, `input`, `navigation-menu` + `sheet`, `card`, `avatar`);
  bespoke compositions (post cards, newsletter, footer, page-info, article/prose,
  author-info, conclusion, ads-space, post-layout). Badge categories =
  exhaustive CVA variant map (missing category = compile error).
- **Storybook** — atomic-design sidebar (`Atoms/`, `Molecules/`, `Organisms/`,
  `Pages/`). Atoms get exhaustive variant/state matrices; molecules/organisms get
  representative-content stories; the `Pages` stories (Home, Single Post,
  Author) built from real organisms + **the actual `Post` type from
  `src/data/posts.ts`** as fixtures, not invented props. (Home and Blog Listing
  were later merged into one Figma-faithful `Home` under the blog-first IA —
  three Pages stories, not four; see spec.md FR-8.)

### Out

- Migrating live app routes (`/`, `/projects`, `/blog`, `/blog/[slug]`) off MUI.
- Removing MUI/Emotion from the dependency tree.
- Restyling portfolio-only surfaces (Domain Areas, Skills, Projects, Reading,
  Topic) — no Figma equivalent; a downstream decision.
- Deploying Storybook to production — it stays **dev-only**, kept out of the
  shipped SSG output (the one new exposure surface).

## Decisions Captured

- **D-1** — MUI end-state: **full replace, phased**. shadcn+Tailwind becomes THE
  styling foundation; MUI+Emotion removed once every surface migrates. This pack
  starts it; the app keeps MUI meanwhile.
- **D-2** — Visual language: **adopt the Figma template look** (light; primary
  `#7F56D9`; Inter).
- **D-3** — Pack DoD: **components + composed page stories** — all atoms→organisms
  AND 4 screens as Storybook `Pages` stories with mock data.
- **D-4** — Palette fidelity: **pixel-match Figma exactly** (`#7F56D9`; light-mode
  body gray `#667085`, dark-mode body gray `#c0c5d0`); recompute AA-contrast per
  hex below (ADR candidate — see Open Questions).
- **D-5** — Theming: **light + dark now**. Light = Figma tokens; dark = the real
  Figma dark-mode frame (node `614:679`) — bg `#090d1f`, headings white, body
  `#c0c5d0` — not derived from `theme.ts`; `next-themes` `class` strategy.
- **D-6** — Token authoring: **author tokens in TypeScript, codegen the CSS**.
  `tokens.ts` is the single source of truth, chosen so `shadcn init` cannot flatten
  the two-layer model (the `repeat-app` precedent — see Open Questions). ADR
  candidate for the codegen pipeline + `@import`-order rule.
- **D-7** — MDX trust boundary **unchanged** (styling-only migration). The
  slug-validation gate (`buildPostSet`) and MDX hardening seam
  (`mdxPresentation.tsx`) are untouched; the owner-authored-only rule is **not**
  relaxed — see ADR-0001.

## Open Questions for /propose

- **Storybook ↔ Next 16 compatibility** — verify the `@storybook/nextjs` adapter
  early; may force `@storybook/react-vite` (loses `next/image`/`next/font` mocks).
  Recommend the design phase open with this spike — it can change the toolchain.
- **Coexistence ordering** — record `StyledEngineProvider injectFirst` + disabled
  Tailwind preflight as an ADR; track "mixed" routes (pay both runtimes) and
  migrate each fully in one pass so pack 2 doesn't rediscover it live.
- **Accepted AA-contrast trade-off (D-4)** — `#7F56D9` on white ≈ 4.96:1 (passes AA
  normal text). `#7F56D9` on the dark bg `#090d1f` ≈ 3.89:1 (fails AA normal text,
  passes AA large text/UI-component 3:1). Record as an accepted-risk ADR, scoped to
  dark-mode text usage; a dark-mode-only `--primary-strong` `#A082E3` (≈6.2:1 on
  `#090d1f`) is the escape hatch for text on dark surfaces.
- **Dark palette has a real Figma source** — the dark frame at node `614:679`
  (ADR-DS-5); light and dark are both pixel-matched from Figma, not one derived
  from the other.
- **base-nova (Base UI) vs stock Radix** — 2 of 3 sibling repos run `base-nova`
  (makes their component code near copy-paste); Radix keeps them reference-only.
  Also confirms the v4 `@custom-variant dark (&:is(.dark *))` requirement.
- **OKLCH vs hex** for the light palette — both shadcn siblings use OKLCH; this PRD
  currently pins **hex** (the `budget-app` precedent proves the hex+codegen path;
  its OKLCH-free choice was a React-Native constraint that doesn't apply here). The
  primary 50–900 ramp is synthetically generated (HSL interpolation) from the single
  observed `#7F56D9` sample — no published ramp exists in Figma — all other hexes
  (badges, grays, backgrounds) are hand-pinned from observed Figma nodes.
- **Lint-enforced token purity** — adopt the sibling GritQL/JS rules
  (`no-direct-palette-import`) to enforce the semantic-only rule mechanically. Note:
  Biome doesn't sort Tailwind classes, and GritQL `language css` plugins were broken
  at Biome 2.4.15 — pin Biome, JS-language rules only.
- **Mobile breakpoint — in scope.** Figma has a real mobile "iPhone 15" frame
  (node `614:353`) with its own light/dark toggle; it is the responsive-breakpoint
  reference for this pack (the old spec had no mobile source and no
  responsive-breakpoint mention at all). See `spec.md` for the concrete FR.

_Cross-repo precedent (`repeat-app`, `budget-app`, `gtd-app`) that shaped D-6 and
the risks above is mined in the wiki: `concepts/frontend-ui-stack.md`._

## Agent Insights (Explore Phase)

_Advisory — enriches the requirements; the owner made all decisions._

### Software Architect (migration strategy)

- **Coexistence:** disable Tailwind `preflight` so MUI `CssBaseline` stays
  authoritative until MUI is gone; pin order with `StyledEngineProvider
  injectFirst`. Storybook is isolated this pack, deferring most pain to pack 2 —
  record the ordering decision as an ADR now. Once real pages mix both systems,
  each mixed route pays Emotion + Tailwind simultaneously; migrate mixed routes
  fully in one pass.
- **Seam pattern survives** (validates the original design). `src/data/*`
  untouched; presentation seams change only output type (MUI `sx` → `cn()`).
  Move hex into Tailwind `@theme`; `brand` demotes to a semantic-name map so
  presentation seams keep `Record<…>` exhaustiveness.
- **Storybook-first is right**, guardrail: build composed components against the
  real `Post` type from `src/data/posts.ts`, not invented props — cheap insurance
  against pack-2 rework. Add a per-component acceptance check (accepts the real
  type) before calling the pack done.
- **Verify:** Storybook 9 ↔ Next 16 adapter; Tailwind v4 needs
  `@tailwindcss/postcss` under Next 16's pipeline; `npm ls react` for dual-React
  after shadcn init; Biome doesn't sort Tailwind classes.

### UX Architect (design-system structure)

- **Two-layer tokens:** primitives → shadcn semantic aliases via `@theme inline`;
  components see only `--primary`/`--foreground`/etc. `--font-sans: "Inter"` (Regular/
  Medium/Semi Bold/Bold only — Work Sans does not appear in the new file). Observed
  type scale: Display xs/Semibold 24/32, Text lg/Semibold 18/28, Text md/Normal 16/24
  (body), Text sm/Semibold 14/20, Text sm/Medium 14/20 — body copy is **Text md
  (16/24)**, not 14px.
- **Badge categories = CVA variant map**, a closed 8-hue enum (all decorative,
  none tied to category name) — exhaustive like `skillPresentation`:
  1. violet: bg `#f9f5ff` / text `#6941c6`
  2. blue/indigo: bg `#eef4ff` / text `#3538cd`
  3. pink/magenta: bg `#fdf2fa` / text `#c11574`
  4. sky: bg `#f0f9ff` / text `#026aa2`
  5. green: bg `#ecfdf3` / text `#027a48`
  6. gray-blue: bg `#f8f9fc` / text `#363f72`
  7. orange: bg `#fff6ed` / text `#c4320a`
  8. rose/red: bg `#fff1f3` / text `#c01048`
- **shadcn reuse:** `badge`, `button`, `input`, `navigation-menu`+`sheet`, `card`,
  `avatar`. **Bespoke:** post cards, newsletter, footer, page-info, article
  (prose layer), author-info, conclusion, ads-space, post-layout.
- **Storybook:** atomic-design title paths; atoms get exhaustive variant/state
  named stories + Playground; molecules/organisms get representative-content
  stories; the 4 screens as composed Pages stories from real organisms + fixtures.
- **A11y:** `#181A2A` on white 16.9:1 (AAA). `#7F56D9` on white 4.96:1 (**passes AA
  normal text**). `#7F56D9` on the dark bg `#090d1f` 3.89:1 (**fails AA normal
  text**, passes AA large text/UI-component 3:1) — use dark-mode `--primary-strong`
  `#A082E3` (≈6.2:1 on `#090d1f`) for text on dark surfaces. `#667085` (light) /
  `#c0c5d0` (dark) body gray passes AA on their respective backgrounds. Badges keep
  text labels (not color-only). Ensure focus-visible rings clear 3:1.
- **Light + dark:** components binding to the semantic layer make dark a single
  `.dark {}` token block sourced from the real Figma dark frame (node `614:679`) —
  enforce "no raw hex/`--brand-*` in components". Keep `next-themes` `class` wiring.
