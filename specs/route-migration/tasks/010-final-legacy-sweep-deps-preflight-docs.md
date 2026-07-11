---
id: "010"
name: Final legacy sweep — theme.ts, deps, preflight, docs
status: todo
blocked_by: ["001", "006", "007", "009"]
max_files: 16
ground_rules:
  - security/deps-and-config.md
  - architecture/general.md
  - frontend/styling.md
  - languages/typescript/patterns.md
test_cases:
  - repo_wide_grep_zero_mui_emotion_framer_motion
  - depspinned_green_after_uninstall
  - npm_audit_passes
  - preflight_active_layer_mui_and_hand_rolled_reset_gone_pages_intact
  - shikivars_gate_green_with_theme_ts_absent
  - salvaged_route_regression_block_passes
  - docs_contain_no_coexistence_guidance
  - e2e_sources_contain_no_mui_era_rgb_literals
estimated_files:
  - src/theme/theme.ts
  - src/theme/layout.ts
  - src/theme/coexistence.test.ts
  - src/theme/darkTheme.test.tsx
  - src/components/storybook-fixtures/CascadeTieFixtureCard.tsx
  - src/components/storybook-fixtures/CascadeTieFixtureCard.stories.tsx
  - e2e/coexistence.spec.ts
  - e2e/cascade-tie.spec.ts
  - e2e/blog.spec.ts
  - e2e/pages-mobile-viewport.spec.ts
  - src/app/layout.tsx
  - src/app/globals.css
  - package.json
  - package-lock.json
  - CLAUDE.md
  - CONTEXT.md
interaction: afk
implementer: generalist
---

## Objective
Delete `theme/theme.ts` + `theme/layout.ts` and all coexistence tooling, remove the six MUI/Emotion packages + `framer-motion` + Orbitron/Geist-sans via the package manager, re-enable Tailwind preflight (OQ-1), salvage the coexistence route-regression e2e block, and bring CLAUDE.md/CONTEXT.md current.

## Implements
| Kind      | Ref |
|-----------|-----|
| FR        | FR-9, FR-10, FR-8 |
| Contract  | —   |
| Data      | —   |
| Scenarios | mui-gone, deps-removed-pins-exact, preflight-reenabled, shiki-gate-green, e2e-token-assertions, docs-current, sec-dep-removal-clean |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | the migration is complete (all prior tasks merged) | searching the source tree and `package.json` | no `@mui/*`, `@emotion/*`, or `framer-motion` import or dependency remains; `npm run build` succeeds |
| 2 | dependencies removed via npm (never a hand-edited lockfile) | both `depsPinned.test.ts` suites (`src/components/ui/`, `src/storybook-tooling/`) and pre-push `npm audit` run | all remaining deps exact-pinned, lockfile consistent, audit passes |
| 3 | MUI `CssBaseline` gone | the Tailwind build runs | preflight enabled; the hand-rolled `@layer base` reset and `@layer mui` are absent from `globals.css` (R-6: this lands here, last) |
| 4 | `theme/theme.ts` is deleted | the pre-push gate runs | the repointed `shikiVars.test.ts` passes against the token-layer source |
| 5 | coexistence suites (`coexistence.spec.ts`, `cascade-tie.spec.ts`, `theme/coexistence.test.ts`, `CascadeTieFixtureCard`) deleted | e2e runs | the salvaged route-regression block lives on in a kept spec; chromium suite green with zero MUI-era rgb literals anywhere |
| 6 | reading CLAUDE.md and CONTEXT.md | after the sweep | no coexistence-era guidance (`@layer mui`, `brand` seam for the MUI surface) contradicts the shipped state |

## Approach
- ADR-RM-5 final sweep: mechanical, verified by mui-gone/deps-removed-pins-exact rather than doing any component migration.
- `npm uninstall @mui/material @mui/icons-material @mui/material-nextjs @emotion/react @emotion/styled @emotion/cache framer-motion`; drop Orbitron + Geist(sans) from `layout.tsx` fonts (keep `--font-geist-mono` per OQ-3, Inter stays).
- Preflight re-enable sequenced here per R-6 — after all routes/stories are on the new family.
- Prune/repoint remaining `theme/` tests (`darkTheme.test.tsx`, build/lint-gate tests if theme-coupled); update `pages-mobile-viewport.spec.ts` if chrome-dependent.

## Implementation Log
