---
id: "008"
name: Delete orphaned portfolio components
status: blocked
blocked_by: ["005"]
max_files: 14
ground_rules:
  - architecture/general.md
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
