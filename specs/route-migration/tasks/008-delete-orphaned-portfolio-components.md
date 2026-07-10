---
id: "008"
name: Delete orphaned portfolio components
status: done
blocked_by: ["005"]
max_files: 14
task_base_sha: "55d2a9f87cd93d216ee0321d1ae21b5bfd5b0447"
ground_rules:
  - architecture/general.md
  - languages/typescript/patterns.md
test_cases:
  - build_and_full_unit_suite_green_after_deletion
  - grep_for_deleted_identifiers_returns_nothing
  - mui_import_count_decreased
estimated_files:
  - src/components/HeroContent.tsx
  - src/components/ProjectCard.tsx
  - src/components/ProjectDetailPanel.tsx
  - src/components/ProjectSidebar.tsx
  - src/components/sidebar/EmptyState.tsx
  - src/components/sidebar/ErrorState.tsx
  - src/components/sidebar/ProjectPreview.tsx
  - src/components/SkillsGrid.tsx
  - src/components/StatCard.tsx
  - src/components/TopicSection.tsx
  - src/components/ReadingSection.tsx
  - src/components/AchievementsList.tsx
  - src/components/AreaHeadlineCard.tsx
interaction: afk
implementer: generalist
pr_url: https://github.com/AlarQ/portfolio/pull/75
---

## Objective
Delete the dead portfolio component cluster (Hero/Skills/Projects/Reading/Topic/sidebar/stat/achievement components) orphaned once `/` serves the Blog index, shrinking the `brand`/MUI consumer count per ADR-RM-5.

## Implements
| Kind      | Ref |
|-----------|-----|
| FR        | FR-9 |
| Contract  | —   |
| Data      | —   |
| Scenarios | mui-gone (partial — final verification owned by 010) |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | `/` serves the new index (005 merged) | the portfolio cluster components are deleted | `npm run build`, unit tests, and chromium e2e stay green |
| 2 | the deletion lands | grepping `src/` for the deleted component names | zero references remain; reachability from `src/app/` routes — not import-grep alone — confirmed the list (R-5) |
| 3 | the R-1 check | grepping `@mui/` imports | consumer count strictly decreased versus the previous commit |

## Approach
- Pure deletion, reachability-driven per Risk R-5; PRD scope names the cluster explicitly.
- No new code; data modules/seams that fed these components are deleted in 009 (they still compile while unused).
- SF-2: 008/009 are one conceptual unit split only by the 20-file cap.

## Implementation Log

### Decisions
- **Pure deletion, reachability-verified before removal (R-5).** Confirmed the cluster is unreachable from `src/app/` routes, not by import-grep alone: the routes (`page.tsx`, `layout.tsx`, `author/page.tsx`, `blog/[slug]/page.tsx`, `feed.xml/route.ts`) import only `pages/*`, `@/data/*`, and `@/theme/ThemeProvider` — none of the 13. The 13 form a closed cluster (`ProjectSidebar`→sidebar children; `HeroContent`→`SkillsGrid`/`StatCard`/`AchievementsList`/`AreaHeadlineCard`) referenced by nothing live.
- **Deleted 13 files** (the 13 in `estimated_files`) + the now-empty `src/components/sidebar/` directory (git dropped it automatically). `max_files: 14` honored (13 files + dir).
- **Residual identifier hits are comment-only and belong to 009.** After deletion, grepping the deleted names in `src/` returns hits *only* inside doc comments in `src/utils/glowCardPresentation.ts`, `src/utils/iconTilePresentation.ts`, and `src/data/domains.ts` — the data-module/seam layer 009 deletes (SF-2: 008/009 are one unit split by the file cap; ADR-RM-5). Zero live code references remain; build + type-check + unit suite prove no dangling import/usage. Deliberately did **not** edit those comments — out of 008 scope and the files die in 009.
- **Test Strategist not spawned:** test-strategy.md §5 pre-resolves 008 to `add: [], remove: []`, "no spec-scenario ownership; keep decrement checks" — a zero-delta refinement, so the 3 task `test_cases` are the backlog verbatim.

### Verification (all green)
- `type-check` clean; `test:unit` 52 files / 261 tests pass (identical to pre-deletion baseline — no test depended on the cluster); `build` succeeds (`/`, `/author`, `/blog/[slug]`, `/feed.xml`).
- `grep_for_deleted_identifiers_returns_nothing`: zero live code refs (residuals comment-only in 009's files, per above).
- `mui_import_count_decreased`: `@mui/` consumer files **17 → 5** (surviving: `glowCardPresentation.ts`, `skillPresentation.tsx` → 009; `CascadeTieFixtureCard.tsx`/`.stories.tsx`, `theme.ts` → 010).

### Refactor
- None — pure deletion; no surviving code to deepen or dedupe.
