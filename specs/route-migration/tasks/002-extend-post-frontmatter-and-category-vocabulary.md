---
id: "002"
name: Extend Post frontmatter + category vocabulary
status: todo
blocked_by: []
max_files: 8
ground_rules:
  - security/input-validation.md
  - languages/typescript/patterns.md
  - architecture/general.md
  - testing/testability.md
test_cases:
  - loader_drops_external_url_coverimage_with_warning
  - loader_drops_dot_dot_coverimage_with_warning
  - unknown_category_warned_and_omitted_post_still_publishes
  - slug_gate_regression_suite_unchanged_and_green
  - category_seam_type_test_missing_record_entry_fails_compile
  - loader_carries_valid_coverimage_and_known_categories_into_post_model
estimated_files:
  - src/data/categories.ts
  - src/utils/categoryPresentation.tsx
  - src/utils/categoryPresentation.test.tsx
  - src/data/postLoader.ts
  - src/data/postLoader.test.ts
  - src/data/posts.ts
  - content/posts/my-spec-driven-workflow.mdx
  - content/posts/second-post.mdx
interaction: afk
implementer: generalist
---

## Objective
Extend `buildPostSet`'s pure core to validate optional `coverImage` + `categories` frontmatter and introduce the typed category vocabulary with its exhaustive presentation seam, unblocking both route slices that render the new fields.

## Implements
| Kind      | Ref                                                                        |
|-----------|-----------------------------------------------------------------------------|
| FR        | FR-5                                                                        |
| Contract  | —                                                                           |
| Data      | `post-frontmatter`                                                          |
| Scenarios | unknown-category-omitted, sec-coverimage-path-validated, sec-slug-gate-unchanged |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | a Post frontmatter with valid `coverImage` (site-relative `/…`) and known `categories` | `buildPostSet` parses it | the Post model carries both fields, typed and optional |
| 2 | a `coverImage` that is an external URL, protocol-relative, or contains `..` | the loader validates frontmatter | build warning + field dropped — no external fetch, no path traversal (`post-frontmatter` constraints) |
| 3 | a frontmatter category not in the vocabulary | the site builds | a build warning names the offending entry, the entry is omitted, the Post still publishes |
| 4 | a filename violating `^[a-z0-9-]+$` | the site builds | candidate skipped with a build warning; no filesystem path derived (gate byte-for-byte unchanged) |
| 5 | a vocabulary category name | `categoryPresentation` resolves it | an exhaustive `Record<CategoryName, BadgeCategory>` returns the hue; a missing entry is a compile error (ADR-RM-2) |

## Approach
- ADR-RM-2: `categories.ts` exports canonical names only (no color/JSX); sibling seam `categoryPresentation.tsx` maps to `BadgeCategory` with the R-4 header comment.
- coverImage posture per design trade-off: allow-list validator in the pure core, **no** fs existence check (accepted gap R-3).
- All validation stays in the loader's single gate; consumers re-validate nothing.
- Scope flag SF-3: the vocabulary labels are an unspecified product-data choice — derive from the existing Post's topics and the Figma badge frame; trivially reversible one-file edit, owner vetoes at review.
- **Shared fixture (test strategy):** create a second published Post MDX under `content/posts/` (valid `coverImage`, known `categories`, headings, a fenced code block, an external link). This is the ≥2-Posts fixture consumed by 004 (prevnext-navigation) and 005 (newest-first ordering, cover cards) — the repo currently has only one Post, so those e2e assertions have no data without it.

## Implementation Log
