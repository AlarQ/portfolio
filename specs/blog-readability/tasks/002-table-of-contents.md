---
id: "002"
name: In-page Table of Contents
status: blocked
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
