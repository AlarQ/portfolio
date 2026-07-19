---
id: "009"
name: Delete orphaned data modules + presentation seams
status: done
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
pr_url: https://github.com/AlarQ/portfolio/pull/76
---

## Objective
Delete the data modules and presentation seams that existed solely to feed the portfolio cluster removed in 008 (plus their tests), completing the reachability-based unwind before the final sweep.

## Implements
| Kind      | Ref |
|-----------|-----|
| FR        | FR-9 |
| Contract  | -   |
| Data      | -   |
| Scenarios | mui-gone (partial - final verification owned by 010) |

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

### Decisions
- **Pure deletion, reachability-verified before removal (R-5).** `glowCardPresentation.ts`, `iconTilePresentation.ts`, `projectPresentation.ts`, `readingPresentation.ts` were already removed by 008's follow-up sweep (commit `7fb3228`) - confirmed via `git log --diff-filter=D`, so 009's live scope narrowed to 8 files: `src/data/{projects,skills,domains,books,topic,experience}.ts` + `src/utils/skillPresentation.tsx` + its sibling `skillPresentation.test.ts`.
- Confirmed zero reachable references before deleting: grepped each module name across `src/` - only `skills.ts` ↔ `skillPresentation.tsx` referenced each other (a closed, unreachable pair), no other file imported any of the eight.
- **Deleted all 8 files** via `git rm` (8 ≤ `max_files: 14`).
- **Residual identifier hits are comment-only**, in `categoryPresentation.tsx`, `badgeVariants.ts`/`.test.ts`/`.typetest.ts`, `theme.ts`, and `data/categories.ts` - doc references to the pattern `skillPresentation`/`domains.ts` established, not live imports. Left untouched (out of scope, no dangling code).
- **`brand` consumer count**: 6 → 4 (`domains.ts`, `skillPresentation.tsx`, `skillPresentation.test.ts` removed). Remaining 4 (`theme.ts`, `tokens.ts`, `CascadeTieFixtureCard.tsx`, `navPresentation.ts`) are all named in task 010's `estimated_files` (theme.ts, CascadeTieFixtureCard) or are theme-adjacent seams (tokens.ts, navPresentation.ts) - none reintroduce the orphaned data/seam layer 009 targeted.
- No new test files: this is a deletion task (same pattern as 008) - behavior is verified by the existing suite staying green, not new assertions.

### Verification (all green)
- `type-check`, `lint`: clean.
- `test:unit`: 49 files / 243 tests pass (down from 50/250 - the 1 removed test file, `skillPresentation.test.ts`, accounts for the delta; no other test depended on the deleted modules).
- `build`: succeeds (`/`, `/author`, `/blog/[slug]`, `/feed.xml`).
- `no_references_to_deleted_modules`: zero live-code references; residual hits are comment-only (see Decisions).
- `brand_consumer_count_at_or_near_zero_only_theme_internal`: 6 → 4, remaining consumers all slated for 010.

### Refactor
- None - pure deletion; no surviving code to deepen or dedupe.
