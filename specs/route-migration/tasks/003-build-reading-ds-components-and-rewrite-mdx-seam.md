---
id: "003"
name: Reading ds/ components + MDX seam rewrite (Storybook-first)
status: done
blocked_by: []
max_files: 15
ground_rules:
  - frontend/components.md
  - frontend/styling.md
  - frontend/accessibility.md
  - frontend/design-tokens.md
  - security/input-validation.md
  - languages/typescript/patterns.md
test_cases:
  - script_element_renders_nothing_neutralizer_survives_rewrite
  - iframe_element_renders_nothing
  - external_link_carries_noopener_noreferrer
  - callout_renders_token_classes_with_no_sx_prop
  - toc_accessible_name_matches_existing_e2e_contract_string
  - prevnext_renders_only_existing_neighbor_at_collection_edges
estimated_files:
  - src/components/ds/TableOfContents.tsx
  - src/components/ds/TableOfContents.stories.tsx
  - src/components/ds/TableOfContents.test.tsx
  - src/components/ds/PrevNextNav.tsx
  - src/components/ds/PrevNextNav.stories.tsx
  - src/components/ds/PrevNextNav.test.tsx
  - src/utils/mdxPresentationBlock.tsx
  - src/utils/mdxPresentationText.tsx
  - src/utils/mdxPresentationText.test.tsx
  - src/utils/mdxPresentation.test.tsx
  - src/components/Callout.tsx
  - src/components/ds/ArticleProse.stories.tsx
  - src/components/ds/ArticleProse.test.tsx
interaction: afk
implementer: engineering/frontend-developer
pr_url: https://github.com/AlarQ/portfolio/pull/70
---

## Objective
Rebuild the article-body reading surface — new `ds/TableOfContents` and `ds/PrevNextNav` with stories, plus the MDX seam rewrite (`mdxPresentationBlock/Text`, `Callout`) from MUI `sx` to token-bound Tailwind with the trust-boundary neutralizers preserved verbatim — Storybook-demoable before any route consumes it.

## Implements
| Kind      | Ref                                                                                  |
|-----------|---------------------------------------------------------------------------------------|
| FR        | FR-3, FR-4                                                                            |
| Contract  | —                                                                                     |
| Data      | —                                                                                     |
| Scenarios | mdx-body-token-styled, sec-script-neutralized, sec-iframe-neutralized, sec-external-link-rel |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | fixture MDX with headings | the `TableOfContents` story renders | the ToC carries the same accessible name the live blog's e2e contract asserts today, entries linking to rehype-slug ids |
| 2 | fixture neighbor Posts | the `PrevNextNav` story renders | prev/next links styled solely on semantic tokens, both themes |
| 3 | fixture body with paragraphs, lists, blockquotes, and a Callout | rendered through the rewritten seam (ArticleProse story) | every element's colors/spacing resolve from semantic-token utilities — no MUI `sx`, no hex/rgb literals |
| 4 | a body containing `<script>` / `<iframe>` | rendered through the rewritten registry | both map to the no-render neutralizers, verbatim per ADR-0001/ADR-RM-1; unit tests green |
| 5 | a body with an external link | the link renders | it carries `rel="noopener noreferrer"` |
| 6 | the pre-commit hook | `lint:stories` runs | every new `ds/` component has a sibling `*.stories.tsx` |

## Approach
- ADR-RM-1: `mdxPresentation.tsx` stays the single seam owning the registry + neutralizers; `ArticleProse` remains a pure slot; restyle `mdxPresentationBlock/Text` + `Callout` in place.
- Storybook-first per CLAUDE.md: stories with light+dark + a11y panel verified before 004 may consume anything here.
- Stories page-agnostic — fixtures from `src/components/storybook-fixtures/`, no router deps.

## Implementation Log

chunks_spawned: 3 (delegated `engineering/frontend-developer`, bounded-context TDD per ADR-0018; K=3, backlog=7 behaviors)

### Chunk 1 — MDX trust-boundary seam locks (behaviors 1–3)
Locked the load-bearing MDX trust boundary at the `src/utils/mdxPresentation.tsx` seam via a new `describe("mdx seam trust-boundary neutralizers")` block in `src/utils/mdxPresentation.test.tsx`, exercising `mdxComponents.script`/`.iframe`/`.a` directly (createElement + `renderIntoDocument`), never through `ArticleProse` composition (that level already covered — `ArticleProse.test.tsx`/`.structure.test.ts` left untouched). Assertions (VERBATIM per ADR-0001/ADR-RM-1): `script`→no `<script>`, empty textContent, never contains body; `iframe`(`NoIframe`)→no `<iframe>`; external anchor→exact `rel="noopener noreferrer"`+`target="_blank"` spread AFTER caller props (caller-can't-clobber lock added), internal/relative href gets neither. No source changes needed — neutralizers + hardening pre-existed; these are regression locks the chunk-2/3 rewrite had to keep green.

### Chunk 2 — ToC + seam MUI→Tailwind rewrite (behaviors 4–6)
New `ds/TableOfContents.tsx` (+`Molecules/TableOfContents` story, +test): presentation-only `<nav aria-label="Table of contents">` (byte-for-byte lock for `e2e/blog-toc.spec.ts`), consumes existing `src/data/postToc.ts` `TocEntry[]`, anchors to `#id` in document order; legacy `PostToc.tsx` scroll-spy NOT ported (004 owns route behavior). Extended the seam source-grep guard to forbid `sx=`/`@mui/`/`brand` across `mdxPresentationText.tsx`+`mdxPresentationBlock.tsx`+`Callout.tsx`; that RED drove the MUI→Tailwind rewrite of those three onto semantic tokens (`text-foreground`, `text-muted-foreground`, `text-primary`, `bg-muted`, `border-border`, `border-l-primary`, ring/outline focus). Anchor now plain `<a>`. `Callout.tsx` rewritten (+`Callout.test.tsx`). `ArticleProse.stories.tsx` `sampleBody` extended (list/blockquote/Callout/external link, router-free for 004 reuse). Necessary side-effects: `proseTextSx`→`proseReadingFontSize` string export (its sole consumer `PostReadingLayout.tsx` updated); task-005 implementation-coupled tests in `mdxPresentationText.test.tsx` re-expressed against the token interface (same behavior: 18px body, pinned 1.7 rhythm, em-based inline code). Chunk-1 seam assertions stayed green throughout.

### Chunk 3 — PrevNextNav + closing whole-diff refactor (behavior 7)
New `ds/PrevNextNav.tsx` (+`Molecules/PrevNextNav` story, +test): presentation-only `<nav aria-label="Post navigation">` taking explicit optional `prev?`/`next?` `Post` props (Post type has no neighbour field); `prev`→"Newer post", `next`→"Older post", each `/blog/${slug}`; both absent→`null`. **Preserved the legacy `PostNav.tsx` contract verbatim** (accessible name "Post navigation", link names "Newer post"/"Older post", `/blog/${slug}` hrefs) so task 004's `e2e/blog-nav.spec.ts` route wiring stays green. Token-only styling. Tests: middle/newest-edge/oldest-edge/no-neighbour (unit render only; route nav is 004's e2e). Closing whole-task refactor: extracted the one genuine cross-molecule duplication — the shadcn 3px focus-ring fragment shared by `TableOfContents`+`PrevNextNav` — into `src/components/ds/readingNav.ts` `READING_NAV_FOCUS_RING` (a `.ts` helper, auto-exempt from `check-stories`). Deliberately did NOT merge the seam's outline-based `FOCUS_RING` (different affordance). All behavior tests survived unchanged.

**Final gates (main session):** `test:unit` 260 passed / 1 skipped, `type-check` clean, `lint` clean (220 files), `lint:stories` clean.

**File-count note:** 15 source files touched vs `max_files: 13`. The +2 are unforeseen but justified: `PostReadingLayout.tsx` (out-of-seam consumer of the removed `proseTextSx`/`brand`) and `readingNav.ts` (closing-refactor extraction). Flagged for `/validate`.
