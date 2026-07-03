---
id: "003"
name: Prev/next Post navigation
<<<<<<< HEAD
status: done
=======
status: in-progress
>>>>>>> e0c3497 (chore(003): mark task in-progress)
blocked_by: []
max_files: 5
ground_rules:
  - architecture/general.md
  - languages/typescript/type-safety.md
  - frontend/components.md
  - security/authz.md
  - testing/coverage.md
  - testing/structure.md
test_cases:
  - adjacency_middle_post_returns_both_neighbors
  - adjacency_boundary_post_returns_one_sided
  - adjacency_single_post_returns_neither
  - adjacency_ordering_matches_byNewestThenSlug
  - e2e_middle_post_shows_both_links_resolving_to_correct_slugs
  - e2e_boundary_post_shows_only_one_link
estimated_files:
  - src/data/postLoader.ts
  - src/data/postLoader.test.ts
  - src/components/PostNav.tsx
  - src/app/blog/[slug]/page.tsx
  - e2e/blog-nav.spec.ts
interaction: afk
implementer: engineering/frontend-developer
pr_url: https://github.com/AlarQ/portfolio/pull/43
---

## Objective
Compute previous/next Post adjacency as a pure helper over the `buildPostSet` ordered set and render a `PostNav` footer on the detail page, so readers can move between Posts without returning to the index.

## Implements
| Kind      | Ref                                                        |
|-----------|------------------------------------------------------------|
| FR        | FR-3                                                       |
| Data      | adjacency helper (`src/data/postLoader.ts`)               |
| Scenarios | prevnext-middle-post, prevnext-boundary-post, sec-prevnext-single-slug-gate |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | a Post in the middle of the newest-first ordered set | its detail page renders | `PostNav` shows a previous and a next link, each pointing to the adjacent Post's `/blog/<slug>` |
| 2 | the newest or oldest Post at a boundary | its detail page renders | the missing side is absent (no dead link to a non-existent Post) |
| 3 | prev/next target slugs | links are generated | they are drawn from the same validated set (`getPosts()`/`buildPostSet`) — no independent slug source or second gate |
| 4 | a single-Post blog | the only detail page renders | neither prev nor next is shown and no error occurs |

## Approach
- Add a pure `getAdjacentPosts(slug)` (or `adjacency(posts, slug)`) helper in `src/data/postLoader.ts` over the already-ordered set; return `{ prev?, next? }`.
- Render `PostNav` and slot it at the foot of the `PostArticle` frame in `page.tsx`. **Decision (grilling 2026-07-02): each link shows the Post title + a small "Newer post" / "Older post" caption** with a directional arrow (← newer, older →). **No dek.** Labels are "Newer/Older" (not "Previous/Next") since adjacency is date order. **Side-by-side on desktop, stacked vertically on mobile** (no half-width cards truncating titles on phones).
- Reuse the existing validated set — do not re-validate or re-read slugs (single slug gate, sec-prevnext-single-slug-gate).

> **Repo reality (2026-07-02): `content/posts/` holds a single Post** (`my-spec-driven-workflow.mdx`). The four `adjacency_*` **unit** cases fully cover middle/boundary/single/ordering logic over synthetic Post arrays and are the primary gate. The two multi-Post **e2e** cases (`e2e_middle_post_shows_both_links_resolving_to_correct_slugs` needs ≥3 Posts; `e2e_boundary_post_shows_only_one_link` needs ≥2) have no real content to assert against — implement them against an **injected/fixture Post set** rather than real pages, or defer them until a second/third Post lands. Against current content only acceptance #4 (single-Post: neither link, no error) is directly exercisable.

## Implementation Log

chunks_spawned: 2

**Chunk 1** — `getAdjacentPosts(posts: readonly Post[], slug: string): PostAdjacency` added to `src/data/postLoader.ts`, next to `buildPostSet`. Pure — takes an already-ordered `Post[]` + slug, no filesystem, no re-validation. Returns `{ prev?: Post, next?: Post }` where `prev` = newer neighbor (index-1 in newest-first array), `next` = older neighbor (index+1); field names kept generic per task wording, "newer"/"older" labeling deferred to the presentation seam. Unknown slug returns `{}` safely. 4 unit tests in `src/data/postLoader.test.ts` (middle, both boundaries split into two `it`s, single-Post).

**Chunk 2** — Added ordering-consistency unit test confirming `getAdjacentPosts` walks the same array `buildPostSet`/`byNewestThenSlug` produce (no separate ordering logic). New `PostNav` component (`src/components/PostNav.tsx`): `PostNavProps extends PostAdjacency` (reuses the data-layer type directly). Renders `null` when both sides absent (acceptance #4). Each side is an MUI `Box`-as-`next/link` (same pattern as `PostCard.tsx`) with a "← Newer post" / "Older post →" caption above the title, no dek, all colors from `theme.ts` `brand` tokens. Grid stacks on mobile (`xs: "1fr"`), side-by-side ≥`sm`. Wired via a new required `adjacency: PostAdjacency` prop on `PostReadingLayout`, slotted inside the prose column below `PostArticle`'s content (not the ToC gutter); `page.tsx` computes `getAdjacentPosts(getPosts(), slug)` and passes it through — slugs drawn only from the already-validated Post set, no second gate.

**Backlog deviation (e2e multi-Post fixture):** repo has no fixture/injectable-content-dir mechanism for e2e (confirmed against `blog-detail.spec.ts`, `blog-toc.spec.ts`, `PostList.test.tsx`). Per the task's documented fallback, no heavyweight fixture mechanism or new test-lib dependency was added. `e2e_middle_post_shows_both_links_resolving_to_correct_slugs` and `e2e_boundary_post_shows_only_one_link` are instead covered as component-level tests in `src/components/PostNav.test.tsx` (via `react-dom/server`'s `renderToStaticMarkup` over fixture props — already-available dep). `e2e/blog-nav.spec.ts` covers acceptance #4 (single-Post boundary) against real content, the one case the current single-Post repo can actually exercise end-to-end.

**File-count note:** actual changed files (7: `postLoader.ts`, `postLoader.test.ts`, `PostNav.tsx`, `PostNav.test.tsx`, `PostReadingLayout.tsx`, `page.tsx`, `e2e/blog-nav.spec.ts`) exceed `estimated_files`/`max_files: 5` — the extra two (`PostNav.test.tsx`, `PostReadingLayout.tsx`) were needed for the component-test fallback and correct slotting; no scope creep beyond the task's stated objective.

**Verification:** `npm run type-check` clean; `npm run test:unit` 12 files / 64 tests passed; `npx playwright test e2e/blog-nav.spec.ts e2e/blog-detail.spec.ts e2e/blog-toc.spec.ts e2e/blog.spec.ts --project=chromium` — 22 passed, no regressions.
