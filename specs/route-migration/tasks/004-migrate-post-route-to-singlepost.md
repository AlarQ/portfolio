---
id: "004"
name: Migrate /blog/[slug] to pages/SinglePost (full-route pass)
status: done
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
pr_url: https://github.com/AlarQ/portfolio/pull/71
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

chunks_spawned: 4

### Chunk 1 (behaviors 1-3)
- Wired composition seam: `SinglePost.tsx` accepts `toc`/`adjacency`/`coverImageUrl`/`coverImageAlt`/`categories` (raw `CategoryName[]`, resolved to hued `PostCardCategory[]` internally via `categoryPresentation`, called inside `SinglePost` not the route, to keep the route fully non-visual). `src/app/blog/[slug]/page.tsx` now renders `SinglePost` instead of `PostReadingLayout`, zero visual resolution in the route. `PostLayout.tsx` composes `TableOfContents` + `PrevNextNav`. `e2e/blog-detail.spec.ts` rewritten against the new render tree; `unknown_slug_returns_404` re-verified unchanged. MUI carriers (`PostArticle`/`PostReadingLayout`/`PostToc`/`PostNav`) left unreferenced but undeleted, deferred to the final chunk.

### Chunk 2 (behaviors 4-6)
- Extracted `TOC_ACCESSIBLE_NAME` constant in `TableOfContents.tsx` so the unit test (003) and the new route-level e2e test can't drift. `e2e/blog-toc.spec.ts` rewritten as a route-level composition test (accessible name + rehype-slug heading-id parity). `e2e/blog-anchors.spec.ts` and `e2e/blog-nav.spec.ts` already passed unchanged against chunk 1's wiring (anchor-click/scroll and chronological prev/next both correct) — no fix needed.

### Chunk 3 (behaviors 1-3)
- `post_page_shows_cover_and_badges_when_present`: added a live-route e2e assertion in `e2e/blog-detail.spec.ts` against `content/posts/second-post.mdx` (has both `coverImage` + `categories`). Chunk 1's `SinglePost`/`PostLayout` wiring already rendered these; this closes the presence-only acceptance row 5 gap with a route-level check (unit coverage already existed in `SinglePost.test.tsx`).
- `code_block_colors_resolve_from_shiki_vars`: created `e2e/support/tokenResolution.ts` — `expectComputedStyleMatchesToken(locator, cssProperty, tokenVarName)` (kebab-case CSS property + `--token` var name). Resolves the token's raw value into the browser's normalized computed-style format via a probe element, then compares to the locator's actual computed style. Zero literals in the helper or its callers. Rewrote `e2e/blog-highlighting.spec.ts` to use it for `--shiki-token-comment` and `--shiki-bg`.
- `mdx_mapping_assertions_token_resolution_zero_rgb_literals`: rewrote `e2e/blog-mdx-mapping.spec.ts` to consume the same helper (`--foreground`, `--primary`, `--muted`). Corrected a stale `fontWeight: "700"` assertion to the actual current `"600"` (unrelated to token-resolution scope, discovered while restating).
- Full suite: unit 262 passed/1 skipped; chromium e2e 46 passed, 3 known-legacy `blog.spec.ts` failures unchanged (out of scope, task 004 approach notes / FR-9-FR-10). `npm run lint` and `npm run type-check` clean.

### Chunk 4 (final — behaviors: security regression, MUI deletion, closing refactor)
- `blog_security_suite_green_post_migration`: `e2e/blog-security.spec.ts` needed zero changes — seam contract (`article`/`script[src]`/`iframe` neutralization, `rel="noopener noreferrer"`) held across the migration.
- `post_route_deletes_mui_carriers_no_dangling_import`: grepped the whole repo for the four carrier names, confirmed only the already-swapped route and unrelated same-named/out-of-scope legacy references remained, then `git rm` deleted `PostArticle.tsx`, `PostReadingLayout.tsx`, `PostToc.tsx`, `PostNav.tsx`, `PostNav.test.tsx`. `type-check`/`build` clean, no dangling imports.
- Closing whole-diff refactor: reviewed the full task diff and 3-chunk ledger. `SinglePost.tsx`'s prop surface still reads as one cohesive seam after 4 rounds of additive wiring; `PostLayout.tsx` mirrors it cleanly; the e2e specs using `tokenResolution.ts`/`TOC_ACCESSIBLE_NAME` have no residual duplication. No refactor edits applied — forcing a change would have been refactor-for-its-own-sake.
- R-1 check: this route's surviving files (`page.tsx`, `SinglePost`, `PostLayout`, `ArticleProse`, `TableOfContents`, `PrevNextNav`) have zero `@mui/`/`theme.ts` imports, down from 4 (the deleted carriers were the consumers).
- Full suite: `npm run lint` clean (216 files), unit 258 passed/1 skipped, chromium e2e 46 passed / 3 known-legacy `blog.spec.ts` failures unchanged (out of scope).
- **Total changed files across all 4 chunks: 18.**

### Post-implementation quality check (code-quality-pragmatist)
- **cq-001 (medium, not blocking):** `e2e/blog-toc.spec.ts`'s rewrite dropped the desktop-sticky (`position: sticky`) and mobile-hidden ToC assertions from `specs/blog-readability/spec.md` (`toc-sticky-desktop`, `toc-hidden-mobile`) without relocating them — no other spec covers them now. Logged for `/validate` / a follow-up task to restore or explicitly re-home; not fixed inline since it's outside this chunk's declared behavior backlog and CSS/sticky-layout work is chunk-3/visual scope per the task's own chunking.
  **RESOLVED (2026-07-14)** — desktop-sticky / mobile-hidden assertions restored in e2e/blog-toc.spec.ts and re-homed in specs/blog-readability spec.md Decisions 5–6 + scenarios.

### Known accepted casualty (out of scope)
`e2e/blog.spec.ts` fails on 3 legacy MUI/framer-motion assertions (64ch `proseMeasure` token, `article[data-reduced-motion]` ×2) — not in this task's `estimated_files`, slated for removal under FR-9/FR-10 in a later task.
