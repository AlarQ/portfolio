---
id: "004"
name: Migrate /blog/[slug] to pages/SinglePost (full-route pass)
status: blocked
blocked_by: ["002", "003"]
max_files: 16
ground_rules:
  - languages/nextjs/app-router.md
  - languages/nextjs/server-vs-client.md
  - frontend/accessibility.md
  - testing/structure.md
test_cases:
  - post_page_statically_generated_renders_title_date_body
  - unknown_slug_returns_404
  - toc_aria_name_and_heading_ids_preserved_chromium
  - anchor_click_updates_fragment_and_scrolls
  - prevnext_links_resolve_to_chronological_neighbors
  - code_block_colors_resolve_from_shiki_vars
  - blog_security_suite_green_post_migration
  - mdx_mapping_assertions_token_resolution_zero_rgb_literals
  - post_page_shows_cover_and_badges_when_present
estimated_files:
  - src/app/blog/[slug]/page.tsx
  - src/components/pages/SinglePost.tsx
  - src/components/pages/SinglePost.stories.tsx
  - src/components/PostArticle.tsx
  - src/components/PostReadingLayout.tsx
  - src/components/PostToc.tsx
  - src/components/PostNav.tsx
  - src/components/PostNav.test.tsx
  - e2e/blog-detail.spec.ts
  - e2e/blog-toc.spec.ts
  - e2e/blog-anchors.spec.ts
  - e2e/blog-nav.spec.ts
  - e2e/blog-mdx-mapping.spec.ts
  - e2e/blog-highlighting.spec.ts
  - e2e/blog-security.spec.ts
  - e2e/support/tokenResolution.ts
interaction: afk
implementer: engineering/frontend-developer
---

## Objective
Serve `pages/SinglePost` at `/blog/[slug]` through the existing single-slug-gate MDX pipeline with SSG, ToC/prev-next/anchors/cover/categories wired to real data, deleting this route's MUI carriers and updating its e2e suite to token-resolution assertions.

## Implements
| Kind      | Ref |
|-----------|-----|
| FR        | FR-2, FR-3, FR-4 |
| Contract  | —   |
| Data      | `post-frontmatter` |
| Scenarios | post-page-renders, unknown-slug-404, toc-contract-preserved, prevnext-navigation, heading-anchors-preserved |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | a Post with slug `s` | a reader visits `/blog/s` | `pages/SinglePost` renders the Post's metadata and MDX body, statically generated; `generateStaticParams` still only maps the already-validated set |
| 2 | no Post with slug `nope` | a reader visits `/blog/nope` | 404 page |
| 3 | a Post body with headings | the page renders | ToC accessible name and rehype-slug heading ids match today's e2e contracts; activating an anchor sets the matching fragment and scrolls |
| 4 | at least two published Posts | viewing a Post with a chronological neighbor | prev/next navigation links to the neighbor(s) |
| 5 | valid / absent `coverImage` + `categories` | the Post page renders | cover + vocabulary-hued Badges display when present; graceful degradation with no placeholder when absent |
| 6 | the route's e2e specs | color assertions run | computed styles compared against resolved semantic-token variables (OQ-5) — no MUI-era rgb literals; `blog-security.spec.ts` stays green unmodified in intent |

## Approach
- Full-route pass per D-8/ADR-RM-5: same branch deletes this route's MUI consumers (`PostArticle`, `PostReadingLayout`, `PostToc`, `PostNav`).
- Compose `pages/SinglePost` + `ds/{ArticleProse,TableOfContents,PrevNextNav}` + `ui/Badge` from loader output; route resolves nothing visual.
- Restate `blog-mdx-mapping` / `blog-highlighting` assertions as token-resolution checks; chromium is the reliable signal.
- Post-commit R-1 check: grep `@mui/`/`theme.ts` imports and assert the consumer count decreased.
- **Shared helper (test strategy):** create the e2e token-resolution assertion helper under `e2e/support/` (computed style === resolved semantic-token CSS var, per OQ-5) — consumed by 005, 006, 010. As the earliest e2e task it owns creation; if 005 lands first, transfer creation there rather than duplicating. `cover-categories-*` degradation logic and `code-block-highlighted`/`e2e-token-assertions` suite-wide verification are NOT owned here (→ 005 / 001 / 010); row 5 asserts only cover+badge *presence*.

## Implementation Log
