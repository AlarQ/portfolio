---
id: "001"
name: Coexistence tooling + Storybook boot (the toolchain gate)
status: in-progress
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
