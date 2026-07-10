---
id: "009"
name: Delete orphaned data modules + presentation seams
status: todo
blocked_by: ["008"]
max_files: 14
ground_rules:
  - architecture/general.md
  - style/general.md
  - languages/typescript/patterns.md
test_cases:
  - build_and_unit_suite_green_after_data_seam_deletion
  - no_references_to_deleted_modules
  - brand_consumer_count_at_or_near_zero_only_theme_internal
estimated_files:
  - src/data/projects.ts
  - src/data/skills.ts
  - src/data/domains.ts
  - src/data/books.ts
  - src/data/topic.ts
  - src/data/experience.ts
  - src/utils/projectPresentation.ts
  - src/utils/readingPresentation.ts
  - src/utils/skillPresentation.tsx
  - src/utils/glowCardPresentation.ts
  - src/utils/iconTilePresentation.ts
interaction: afk
implementer: generalist
---

## Objective
Delete the data modules and presentation seams that existed solely to feed the portfolio cluster removed in 008 (plus their tests), completing the reachability-based unwind before the final sweep.

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
| 1 | 008 is merged | the orphaned data modules + seams and their tests are deleted | build, unit tests, and chromium e2e stay green; `noUnusedImports`/`noUnusedVariables` lint clean |
| 2 | the deletion lands | grepping `src/` for the deleted module names | zero references remain; only route-reachable data modules (`postLoader`, `posts`, `postToc`, `profile`, `navItems`, `siteConfig`, `rssFeed`, `categories`, `footerLinks` if 006 kept it) survive |
| 3 | the R-1 check | grepping `theme.ts` / `brand` consumers | count strictly decreased; remaining consumers are only `theme/`-internal files awaiting 010 |

## Approach
- Second half of the ADR-RM-5 incremental unwind; verifies the `brand` consumer count is at (or near) zero so 010 is purely mechanical.
- Delete sibling `*.test.*` files of the removed seams in the same pass.

## Implementation Log
