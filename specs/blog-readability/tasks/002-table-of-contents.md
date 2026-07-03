---
id: "002"
name: In-page Table of Contents
status: done
blocked_by: ["001"]
max_files: 6
ground_rules:
  - frontend/components.md
  - frontend/styling.md
  - frontend/accessibility.md
  - languages/typescript/patterns.md
  - security/authz.md
  - testing/structure.md
  - testing/test-quality.md
test_cases:
  - extractor_returns_depth_text_id_array_from_nested_headings
  - extractor_skips_h1_and_handles_no_heading_post
  - e2e_desktop_toc_lists_headings_in_order_and_is_sticky
  - e2e_mobile_toc_is_not_rendered
  - e2e_toc_link_click_resolves_to_heading_id
estimated_files:
  - src/data/postToc.ts
  - src/data/postToc.test.ts
  - src/components/PostToc.tsx
  - src/components/PostArticle.tsx
  - src/app/blog/[slug]/page.tsx
  - e2e/blog-toc.spec.ts
interaction: afk
implementer: engineering/frontend-developer
pr_url: https://github.com/AlarQ/portfolio/pull/42
---

## Objective
Extract a heading tree (depth/text/id) at build time via a pure `src/data/`-layer helper and render it as a sticky desktop TOC aside around the `PostArticle` frame (hidden on mobile), so readers can navigate long Posts.

## Implements
| Kind      | Ref                                                              |
|-----------|------------------------------------------------------------------|
| FR        | FR-1                                                             |
| Data      | heading-tree helper (`src/data/postToc.ts`)                     |
| Scenarios | toc-renders-from-headings, toc-sticky-desktop, toc-hidden-mobile, sec-toc-single-render-seam |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | a Post body with `##`/`###` headings | the detail page renders | a TOC lists those headings in document order with links to their `#<id>`, matching the ids task 001 emits |
| 2 | a desktop viewport | the reader scrolls the Post | the TOC aside is sticky and remains visible; the prose column keeps its centered `64ch` measure (from the theme token) and the aside occupies leftover gutter, never shrinking the reading column |
| 2b | a desktop viewport, reader scrolls through sections | scroll position crosses a heading | the TOC entry for the current section is highlighted (scroll-spy via `IntersectionObserver`); anchor jumps are instant (no smooth-scroll) and honor `usePrefersReducedMotion` |
| 3 | a mobile viewport | the detail page renders | the TOC aside is not displayed and the prose spans full width |
| 4 | the TOC links | the heading render path is inspected | headings still render only through the single `heading()` seam — the TOC reuses those ids and adds no second heading render path |
| 5 | a TOC link is clicked | navigation occurs | the page resolves to the corresponding heading id |

## Approach
- Build a pure heading-extraction helper in `src/data/postToc.ts` returning `{ depth, text, id }[]`, testable without the filesystem. Decide mechanism in-task (remark-exported `tableOfContents` vs. raw-MDX parse); keep it in the data layer, not a component.
- Add `PostToc` consuming that tree; slot it as an aside into/around `PostArticle` (`page.tsx` grid). **Decision (grilling 2026-07-02): leftover-margin layout** — `[gutter | centered 64ch prose | ToC]`; the ToC consumes the side gutter and must never shrink the prose below the `64ch` measure token.
- **Scroll-spy (decided):** highlight the active heading via `IntersectionObserver` (no scroll listener). This makes `PostToc` a `"use client"` seam; keep the extractor/data pure and server-side. Anchor jumps stay instant (no smooth-scroll); honor `usePrefersReducedMotion`.
- Responsive: sticky sidebar at `md+`; **fully hidden below `md`** (`display: none` — hard hide, no collapsible/disclosure variant, per `toc-hidden-mobile`).

## Implementation Log

`chunks_spawned: 2` (delegated to `engineering/frontend-developer` across 2 bounded contexts; K=3, backlog of 5 behaviors cut `[1,2,3]` / `[4,5]`).

### Chunk 1 (behaviors 1–3)
- **Shared slug (id parity):** extractor reuses `github-slugger`'s `GithubSlugger` — the exact algorithm `rehype-slug` runs in the build pipeline — one instance per document, so every ToC `id` matches the DOM heading `id` task 001 emits, including the de-dup counter. Pinned `github-slugger@2.0.0` as a direct dep (was already the resolved transitive version; no drift).
- **Extractor:** `extractPostToc(markdown: string): TocEntry[]`, `TocEntry = { readonly depth: 2|3; readonly text: string; readonly id: string }`, document order. Pure core (no fs); impure rind `getPostToc(slug)` reads the body, strips frontmatter via `gray-matter`, delegates. Trusts the already-validated slug — no second slug gate.
- **Text extraction:** `headingText()` strips only the inline Markdown a heading's text node drops (code keeps inner text, links keep label, emphasis markers removed) while preserving lone underscores, so ids don't diverge from the DOM.
- **Single render seam (`sec-toc-single-render-seam`):** extractor parses text/ids only, renders no HTML; Post body still renders solely via `mdxPresentation.tsx`; ToC labels are React-escaped strings in MUI `Link`s. No second rehype/render path.
- **Behavior 2** was already green under behavior-1's `#{2,3}` regex (skips H1, `[]` when heading-less) — its test locks the contract rather than driving new code.
- **Reduced motion:** honored by construction — native/instant anchor jumps, no animation. `usePrefersReducedMotion` intentionally not imported (would be an unused-var Biome error); rationale documented in `PostToc.tsx`.
- **Layout:** added `proseMeasure = "64ch"` theme token (beside `brand`, not a color); `PostArticle` consumes it; `page.tsx` uses leftover-margin grid `[gutter | 64ch prose | ToC]`. Changed `globals.css` `overflow-x: hidden` → `clip` on `html, body` (hidden established a scroll container that broke descendant `position: sticky`; verified ToC `y` after scroll went `-1488` → `112`).
- **Refactors (local):** extracted `useActiveHeading` hook (IntersectionObserver scroll-spy, no scroll listener); hoisted `isActive` per entry.

### Chunk 2 (behaviors 4–5, final)
- **Behavior 4 (mobile-not-rendered):** added a mobile `viewport 375×667` describe block to `blog-toc.spec.ts` (nav hidden, `article` spans >80% viewport, no body h-scroll). Passed first run — chunk-1's `display: { xs: "none", md: "block" }` + `gridTemplateColumns` collapse already satisfy it. Locks the hard-hide (no collapsible variant) contract; no fabricated RED.
- **Behavior 5 (link-click-resolves):** desktop test reads first ToC link `href`, clicks, asserts URL resolves to `#<id>` and the heading `toBeInViewport()`. Passed immediately — chunk-1's native `<a href="#id">` already satisfies it; no new production code.
- **Closing whole-diff refactor:** extracted a `PostReadingLayout` deep module. The remaining smell was `page.tsx` mixing data-loading (slug lookup, dynamic MDX import, ToC derivation) with ~20 lines of prose↔ToC grid JSX (CLAUDE.md: rendering belongs in a component, not the route). Moved the `[gutter | proseMeasure prose | ToC]` scaffold into `src/components/PostReadingLayout.tsx` (server component passing server MDX children into the client `PostArticle`, unchanged DOM). Route is now load-validate-data → hand off `{ title, toc, body }`. Small interface (`title`, `toc`, `children`), deep implementation. Left the belt-and-suspenders `proseMeasure` constraint (grid column desktop, `PostArticle` `maxWidth`+`mx:auto` mobile) intact — load-bearing at different breakpoints.

**Verification:** `type-check` clean · `lint` (Biome, 94 files) clean · unit `52 passed` (incl. 2 new in `postToc.test.ts`) · chromium e2e `43 passed` (incl. new `blog-toc.spec.ts` + task 001's `blog-anchors.spec.ts`). Webkit/Mobile projects excluded per known pre-existing profile-card failures; behavior 4 driven via chromium at a resized 375×667 viewport.
