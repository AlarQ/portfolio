---
id: "001"
name: Heading ids and hover anchors on the MDX seam
status: implemented
blocked_by: []
max_files: 5
ground_rules:
  - languages/nextjs/anti-patterns.md
  - frontend/components.md
  - frontend/accessibility.md
  - security/deps-and-config.md
  - testing/structure.md
test_cases:
  - heading_seam_renders_id_bearing_element_when_id_prop_present
  - heading_seam_renders_no_anchor_when_id_absent
  - heading_id_derives_deterministically_from_heading_text
  - e2e_post_h2_carries_id_and_hash_navigation_resolves
  - e2e_hover_heading_reveals_anchor_link_with_focus_ring
estimated_files:
  - next.config.ts
  - package.json
  - src/utils/mdxPresentationText.tsx
  - src/utils/mdxPresentationText.test.tsx
  - e2e/blog-anchors.spec.ts
interaction: afk
implementer: engineering/frontend-developer
pr_url: https://github.com/AlarQ/portfolio/pull/41
---

## Objective
Wire `rehype-slug` into the build-time MDX pipeline and surface a hover/focus anchor at the existing `heading()` seam, so every `##`/`###` gets a stable, deep-linkable `id` — unblocking the Table of Contents.

## Implements
| Kind      | Ref                                                    |
|-----------|--------------------------------------------------------|
| FR        | FR-2                                                   |
| Scenarios | anchor-deep-link-resolves, heading-id-stable, sec-dep-hygiene |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | a Post body with `## Section title` | page is built and rendered | the rendered `h2` carries a slug id (`id="section-title"`) produced by `rehype-slug` flowing through the existing `heading()` seam — no second render path added |
| 2 | a rendered heading with an id | user hovers or keyboard-focuses the heading | an anchor affordance appears linking to `#<id>`, reachable by keyboard with a visible focus ring |
| 3 | a URL `/blog/<slug>#<heading-id>` | the page loads | the browser scrolls to and resolves the matching heading |
| 4 | the same Post content across two builds | ids are regenerated | the id for a given heading text is identical build-to-build |
| 5 | the `rehype-slug` dependency is added | lockfile and package.json are inspected | it is pinned from the official registry and added as a serializable `[name, options]` rehype tuple compatible with Turbopack |

## Approach
- Add `["rehype-slug"]` to `rehypePlugins` in `next.config.ts`, keeping the serializable-tuple form the file already documents (Turbopack boundary).
- Extend `heading()` in `src/utils/mdxPresentationText.tsx` to render the hover/focus anchor from the spread `id` — do **not** introduce a parallel heading renderer (preserves the single-seam property, sec-toc-single-render-seam).
- **Decision (grilling 2026-07-02): the anchor is a plain `<a href="#id">`** — click updates the URL hash and scrolls; **no** clipboard-copy handler or "Copied!" toast. Keeps the heading seam free of interaction/hydration JS. The reader copies the deep-link URL from the address bar.
- Style the anchor via `brand` tokens only; reuse the focus-visible outline pattern from the existing `Anchor`.

## Implementation Log

chunks_spawned: 2 (delegated path, K=3; backlog of 5 behaviors cut into [1–3 unit] + [4–5 e2e])

### Chunk 1 — heading seam + rehype-slug (unit)
- `heading(tag)` factory widened `{ children? }` → `{ id?; children? }`; the no-id case is behaviorally unchanged (still spreads `...props` onto `Typography`, so `id` lands on the DOM element).
- Added private (non-exported) `HeadingAnchor` in `mdxPresentationText.tsx`, rendered as a heading child only when `id` is truthy — preserves the single-render-seam property (sec-toc-single-render-seam). It is a plain MUI `<Link href="#id" aria-label="Link to this section">` rendering a literal `#`: `opacity: 0` by default, `opacity: 1` on `&:hover .mdx-heading-anchor` (hook on the parent `Typography` sx) and on `&:focus-visible`. Keyboard-reachable, visible focus ring, `brand` tokens only, no JS/onClick/clipboard — matches the grilling decision.
- `rehype-slug` installed pinned exact (`6.0.0`, no caret) via `npm install --save-exact`; wired into `next.config.ts` `rehypePlugins` as `["rehype-slug"]` before the rehype-pretty-code tuple, keeping the serializable-tuple Turbopack form.
- Behavior-3 (deterministic id) test drives the real `rehype-slug` through a minimal `unified().use(remarkParse).use(remarkRehype).use(rehypeSlug)` pipeline (mirrors next.config.ts) and asserts identical output across two `runSync` calls plus the concrete expected slug. Used `hast-util-to-html` (transitive dep) to avoid adding a test-only `rehype-stringify`.
- Tests call the `heading()` factory's returned component directly and inspect the returned element tree (house style — no `@testing-library/react` added). One extra unit test added beyond the 3 named backlog items (anchor-present assertion) so the "no anchor when absent" test is non-vacuous — flagged per the testing-structure negative-assertion rule.

### Chunk 2 — deep-link e2e + closing refactor
- `e2e/blog-anchors.spec.ts` (chromium): asserts the first `h2` of the real Post `my-spec-driven-workflow` carries `id="the-boundary-i-keep-pushing-out"`; direct nav to `/blog/<slug>#<id>` scrolls it into viewport (`toBeInViewport()`, native hash-scroll — no app JS); hover flips anchor `opacity` 0→1, `anchor.focus()` yields `outline-style: solid`, and clicking updates the URL hash. Both passed on first run — chunk-1 markup already satisfied acceptance rows 2 & 3; no markup change needed for e2e.
- Killed a stale `next-server` squatting port 3000 (known repo gotcha) so Playwright's webServer bound correctly.
- Closing whole-diff refactor: extracted the duplicated focus-ring style (`outline: 2px solid ${brand.skyLight}; outlineOffset: 2`) shared verbatim by the pre-existing `Anchor` and the new `HeadingAnchor` into a single `focusVisibleOutlineSx` constant both spread — one seam owns focus-ring token composition, no observable behavior change.
- Verified after refactor: unit 50/50, chromium e2e 2/2, `type-check` clean, `lint` clean.
