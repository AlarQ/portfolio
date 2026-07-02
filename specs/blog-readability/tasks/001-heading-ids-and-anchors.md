---
id: "001"
name: Heading ids and hover anchors on the MDX seam
status: todo
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
