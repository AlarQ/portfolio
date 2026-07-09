---
id: "005"
name: Invert IA — Blog index at / with /blog 308 redirect
status: blocked
blocked_by: ["002"]
max_files: 13
ground_rules:
  - languages/nextjs/app-router.md
  - languages/nextjs/anti-patterns.md
  - frontend/components.md
  - testing/structure.md
test_cases:
  - root_renders_index_with_posts_newest_first
  - blog_returns_308_to_root
  - feed_item_urls_unchanged
  - pagination_absent_at_one_page_of_posts
  - card_without_cover_categories_no_broken_image_no_badge_row
  - postcard_story_covers_cover_and_category_states
estimated_files:
  - src/app/page.tsx
  - src/app/blog/page.tsx
  - next.config.ts
  - src/components/pages/Home.tsx
  - src/components/pages/Home.stories.tsx
  - src/components/ds/PostCard.tsx
  - src/components/ds/PostCard.stories.tsx
  - src/components/ds/PostCard.test.tsx
  - src/components/PostList.tsx
  - src/components/PostList.test.tsx
  - src/components/PostCard.tsx
  - e2e/blog.spec.ts
  - e2e/feed.spec.ts
interaction: afk
implementer: engineering/frontend-developer
---

## Objective
Serve the `pages/Home` Blog index at `/` with real Posts newest-first (cover/categories live on cards), invert the redirect so `/blog` 308s to `/`, keep RSS URL-neutral, and delete the legacy index's MUI consumers on the same branch.

## Implements
| Kind      | Ref |
|-----------|-----|
| FR        | FR-1, FR-5 |
| Contract  | —   |
| Data      | `post-frontmatter` |
| Scenarios | home-index-renders, blog-redirects-home, rss-urls-unchanged, pagination-hidden-single-page, cover-categories-render, cover-categories-absent |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | published Posts under `content/posts/` | a reader visits `/` | `pages/Home` renders real Post cards (title, date, dek from the loader), newest first |
| 2 | the built site | `/blog` is requested | permanent 308 redirect to `/` (ADR-RM-4: `next.config` `redirects()`, `permanent: true`) |
| 3 | the built site | `/feed.xml` is fetched | every item URL still points at `/blog/[slug]` exactly as before |
| 4 | post count fitting one page | `/` renders | the `Pagination` organism does not render (OQ-6) |
| 5 | cards with / without `coverImage` + `categories` | the index renders | cover + vocabulary-hued Badges when present; no broken image, no empty badge row, no placeholder when absent |

## Approach
- ADR-RM-4: redirect declared in `next.config.ts` `redirects()`; delete `src/app/blog/page.tsx` — no throwaway component.
- Replace `src/app/page.tsx`'s unreachable portfolio composition with `pages/Home` fed by the loader; swap `ds/PostCard`'s hardcoded cover/category stand-ins for the real optional props (story updated same commit).
- Same-branch deletion of the legacy index consumers (`PostList`, legacy `PostCard`) per ADR-RM-5; R-1 grep check post-commit.
- Pagination suppression is caller-side: `pages/Home` conditionally omits `<Pagination>` when `totalPages <= 1`. `ds/Pagination` has no `totalPages <= 1` self-guard (always renders its `<nav>`) — do not add one here; that would widen the touch-list.
- SF-4 hand-off: the "light theme by default" clause of home-index-renders is asserted at 006 (`light-default`); this task asserts content and ordering.

## Implementation Log
