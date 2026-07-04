---
id: "001"
name: Coexistence tooling + Storybook boot (the toolchain gate)
status: implemented
blocked_by: []
max_files: 12
ground_rules:
  - architecture/general.md
  - security/deps-and-config.md
  - style/general.md
  - testing/principles.md
  - languages/nextjs/anti-patterns.md
  - frontend/styling.md
test_cases:
  - storybook_boots_on_next16_no_adapter_errors
  - next_image_and_next_font_render_without_missing_mock_warnings
  - build_succeeds_and_existing_routes_render_unchanged
  - chromium_e2e_passes_no_new_failures
  - mui_cssbaseline_authoritative_with_preflight_disabled
  - emotion_wins_cascade_ties_via_injectfirst
  - new_dev_deps_pinned_and_lockfile_committed
estimated_files:
  - package.json
  - package-lock.json
  - next.config.ts
  - postcss.config.mjs
  - tsconfig.json
  - src/theme/ThemeProvider.tsx
  - src/app/layout.tsx
  - src/app/globals.css
  - .storybook/main.ts
  - .storybook/preview.tsx
  - e2e/coexistence.spec.ts
interaction: hitl
implementer: engineering/frontend-developer
---

## Objective
Land Tailwind v4 + `next-themes` alongside MUI without regressing the live app, and prove Storybook 9 boots on Next 16 — resolving the pack's one discovered, not-decided toolchain risk (ADR-DS-1) before any component work starts.

## Implements
| Kind      | Ref                                                                 |
|-----------|---------------------------------------------------------------------|
| FR        | FR-1, FR-7                                                           |
| Scenarios | tooling-coexists-no-regression, preflight-disabled-baseline-intact, storybook-boots, sec-deps-pinned-and-locked |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | the installed Next 16 version and `@storybook/nextjs` (fallback `@storybook/react-vite` per ADR-DS-1) | `npm run storybook` runs | the workshop boots with no adapter console errors, and a story importing `next/image` + a component using `next/font` render without the raw-`<img>`/font-loader warnings that signal a missing mock |
| 2 | Tailwind v4 (`@tailwindcss/postcss`) and `next-themes` added with preflight disabled | `npm run build` runs | the build succeeds, every existing route renders visually unchanged, and the chromium e2e suite passes with no new failures |
| 3 | preflight disabled and `StyledEngineProvider injectFirst` | a page mounts both MUI `CssBaseline` and the Tailwind layer | MUI `CssBaseline` stays authoritative for base elements and Emotion wins cascade ties against Tailwind utilities |
| 4 | new dev-deps (Tailwind v4, `@tailwindcss/postcss`, Storybook 9 + addons, `next-themes`) enter the tree | they are introduced | versions are pinned (not caret) and `package-lock.json` is committed |

## Approach
- Open with the ADR-DS-1 spike: verify `@storybook/nextjs` on Next 16; branch to `@storybook/react-vite` only on a negative result, recording the mock-loss consequence.
- Apply ADR-DS-2: disable Tailwind preflight in the PostCSS config; pin `StyledEngineProvider injectFirst` in the app providers.
- Register `light`+`dark` with `next-themes` `class` strategy (token values land in Task 008); scaffold `.storybook/main|preview`.
- Gate the result on chromium e2e (the reliable signal per CLAUDE.md), not webkit/mobile.

## Implementation Log

chunks_spawned: 3

**Chunk 1 (53f21f7) — Storybook boot + coexistence base**
- ADR-DS-1: `@storybook/nextjs@10.4.6` + `storybook@10.4.6` (pinned exact) work directly against Next `16.2.9` — no `@storybook/react-vite` fallback needed. Verified via `src/storybook-tooling/storybookBuild.test.ts` and `e2e/storybook-adapter.spec.ts` against fixture `src/components/storybook-fixtures/AdapterFidelityCard.tsx`. `@storybook/addon-essentials` skipped — folded into core in Storybook 9/10, standalone package stuck at v8 (incompatible).
- ADR-DS-2 deviation: literal `StyledEngineProvider injectFirst` caused a real hydration mismatch with this app's `AppRouterCacheProvider`-based streaming SSR. Switched to `AppRouterCacheProvider options={{ enableCssLayer: true }}` (src/app/layout.tsx) + `@layer theme, utilities, mui;` ordering in globals.css (mui declared last wins ties) — same goal, streaming-safe. `ThemeProvider.tsx` no longer needs `StyledEngineProvider`; docblock records why. Preflight disabled via `tailwindcss/theme` + `tailwindcss/utilities` imports only (never the umbrella import or `tailwindcss/preflight`).
- Confirmed no regression via `git stash` comparison against baseline; the two pre-existing chromium failures (`blog.spec.ts` prose-measure, `feed.spec.ts` localhost-in-URL) reproduce identically pre-change.
- `next-themes` installed as a runtime dep but not yet wired into a provider (deferred to Task 008 per backlog scope — see code-quality-pragmatist finding cq-002 below).

**Chunk 2 (39fc6ec) — e2e regression seam + build gate**
- Cascade-tie behavior reframed from "injectFirst" to "MUI wins cascade ties via `@layer` ordering" per chunk 1's deviation: `CascadeTieFixtureCard` + `e2e/cascade-tie.spec.ts` assert resolved `getComputedStyle` background-color, not just layer declaration order.
- `e2e/coexistence.spec.ts` extended to cover all 4 routes. `/` redirects to `/blog` and `/projects` is an intentional 404 (confirmed via `next.config.ts` / `src/data/navItems.ts`) — asserted that behavior itself, not fabricated content. `/blog` and a real post slug assert real content + zero console errors.
- Build-gate added as `src/theme/buildGate.test.ts`, CI-only (`skipIf(!process.env.CI)`) to avoid slowing local TDD iteration.

**Chunk 3 (ba17d8b, 775b206) — dep pinning, scaffold, whole-task refactor**
- `src/storybook-tooling/depsPinned.test.ts` scopes the pin/lockfile check strictly to this task's own deps (`next-themes`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `storybook`, `@storybook/nextjs`) — Biome (003) and Radix/CVA/shadcn (004) pinning is out of scope here.
- `.storybook/preview.tsx` now wraps stories in the real `ThemeProvider` via a decorator; `previewThemeDecorator.test.tsx` asserts MUI `CssBaseline`'s injected style tag is present (proxy for "real provider mounted").
- Whole-task refactor: extracted the duplicated build-static-Storybook-and-serve harness from `storybook-adapter.spec.ts` and `cascade-tie.spec.ts` into `e2e/support/storybookStaticServer.ts`. Removed a redundant per-story `ThemeProvider` wrap in `CascadeTieFixtureCard.stories.tsx` (now supplied globally). Did not extract the fixture components themselves — each is small, distinct, and only 2 call sites.
- Full suite green throughout: 90 vitest + 1 CI-skipped, type-check/lint clean, 52/54 chromium e2e (2 pre-existing documented failures, zero new regressions).

**Post-implementation quality check (code-quality-pragmatist, advisory, non-blocking — no high/critical findings):**
- cq-001 (medium): Storybook static build re-run 3-4x across vitest + 2 e2e specs with no build sharing — candidate for a shared Playwright globalSetup build in a later task.
- cq-002 (medium): `next-themes` added and pin-tested but not yet registered (provider wiring deferred to Task 008 per this task's scope).
- cq-003 (low): `buildGate.test.ts` may be redundant with the e2e suite's implicit build-success signal.
- cq-004 (low): Storybook-only fixture components live under `src/components/storybook-fixtures/` rather than a test/tooling-specific tree — blurs the seam-pattern boundary CLAUDE.md establishes for `src/components/`.
- None block this task; carried forward for `/validate` / later cleanup.
