---
id: "002"
name: Extend Post frontmatter + category vocabulary
status: done
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

### Outcome
All 8 behaviors delivered TDD (RED→GREEN each). Green: unit 244✓ / type-check✓ / lint✓ / build SSG✓ (both `/blog/[slug]` routes prerender) / chromium e2e 50/50✓.

### What was built
- `src/data/categories.ts` — closed `CATEGORY_NAMES` const → `CategoryName` union + `isCategoryName` guard. Product data only, no color/JSX (ADR-RM-2). Vocabulary (SF-3) derived from existing Post topics + Figma badge frame.
- `src/utils/categoryPresentation.tsx` — exhaustive `Record<CategoryName, BadgeCategory>` seam (+ `.test.tsx`, `.typetest.tsx`). Missing entry = compile error, mirrors `skillPresentation`/`badgeVariants` precedent. R-4 cross-pack dep documented in header.
- `src/data/postLoader.ts` — `validateCoverImage` (allow-list: site-relative `/…`, reject external / protocol-relative `//` / `..`; warn+drop; **no** fs existence check, accepted gap R-3) + `validateCategories` (warn+omit unknown, Post still publishes) in the pure `toPost` core. Single gate; consumers re-validate nothing.
- `src/data/posts.ts` — `Post` gains optional `coverImage?: string` / `categories?: readonly CategoryName[]`.
- `content/posts/second-post.mdx` — mandated ≥2-Post shared fixture (valid coverImage `/images/profile.jpg`, categories `[Engineering, Workflow]`, headings, fenced code, external link). Consumed by 004/005.

### Scope: files vs `max_files: 8`
Final count **11** touched (8 estimated + 3 forced). The 3 overages are all downstream consequences of the mandated `second-post.mdx` fixture, not scope creep — going from N=1 to N=2 Posts activated latent issues:
1. `src/components/PostNav.tsx` — added `"use client"`. Second post made `/blog/[slug]` actually render `PostNav` with a non-null adjacent Post; passing the `next/link` function as a prop across the RSC Server→Client boundary threw a serialization error at build. `prev`/`next` are plain serializable data so the server route still hands them down. (Legacy MUI surface; superseded by `ds/PrevNextNav` later in the migration — this keeps the build green until then.)
2. `e2e/blog-nav.spec.ts` — the prev/next nav spec was written for N=1 (asserted nav absent); N=2 invalidated it, rewritten to assert real Newer/Older linking.
3. `e2e/feed.spec.ts` — **latent bug the fixture exposed.** The test derived expected feed-item count from `[data-testid="featured-post"]` only, which is always 1 (`PostList`/`splitFeatured` carves one featured card + a `post-list-item` tail). Coincidentally equalled the 1-item feed at N=1; at N=2 the feed correctly had 2 items but the selector still counted 1. Fixed to count `featured-post` + `post-list-item` = the full published set. Test-only correction, no product-code change.

`content/posts/my-spec-driven-workflow.mdx` (in `estimated_files`) was **not** edited — its existing frontmatter already satisfied the new optional fields; no change needed.

### Gotchas
- **Stray dev-server / `SITE_URL` config-loader gotcha.** `playwright.config.ts` sets `SITE_URL=https://ernest.dev` only for a Playwright-*started* server, with `reuseExistingServer: !CI`. A leftover `npm run dev` on :3000 (started without `SITE_URL`) gets reused → the feed renders `localhost:3000` links → `feed.spec.ts` "never localhost" assertion fails. Not a code bug: kill :3000 before the sweep so Playwright starts its own server with the env. (Also: config env-var expansion is zsh-vs-bash sensitive — wrap in `bash -c` when driving it manually.)

### Pre-flight review (code-quality-pragmatist)
Two findings applied, rest declined:
- **Applied (medium):** `validateCategories` now dedupes (`[...new Set(known)]`) — a repeated frontmatter category (`[AI, …, AI]`) would otherwise render a duplicate badge with no warning. Added `dedupes repeated categories …` unit test.
- **Applied (low):** `validateCoverImage` `..` guard changed from substring `!value.includes("..")` to path-segment `!value.split("/").includes("..")`, so the impl matches its comment's traversal-prevention claim precisely and won't false-reject a filename that merely contains `..`. Existing `/images/../../etc/passwd.png` drop-test stays green.
- **Declined:** extracting a shared `validateOptional` helper (premature for two call sites — revisit if a third optional-field validator lands) and `String(value)` → `[object Object]` warning nit (owner-authored build-time input, not worth it).

Post-fix green: unit **245**✓ / type-check✓ / lint✓ / build SSG✓ / chromium e2e 50/50✓.

### Integration
Branch `feat/route-migration/002-…`; PR base is `feat/route-migration-integration` (the real integration branch, not the skill's literal `feat/route-migration`).
