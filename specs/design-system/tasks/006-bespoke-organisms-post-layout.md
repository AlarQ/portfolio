---
id: "006"
name: Bespoke organisms + post-layout (with MDX trust-seam guardrail)
status: todo
blocked_by: ["004", "005"]
max_files: 8
ground_rules:
  - style/general.md
  - architecture/general.md
  - languages/typescript/react-patterns.md
  - testing/principles.md
  - security/authz.md
  - frontend/components.md
test_cases:
  - footer_article_prose_and_post_layout_exist_as_components
  - post_layout_composes_molecules_not_reimplemented
  - article_prose_consumes_only_hardened_mdx_seam_output
  - article_prose_adds_no_second_mdx_render_path
  - postloader_and_mdxpresentation_are_byte_unchanged
  - each_organism_has_representative_content_story_under_organisms
estimated_files:
  - src/components/ds/Footer.tsx
  - src/components/ds/ArticleProse.tsx
  - src/components/ds/PostLayout.tsx
  - src/components/ds/Footer.stories.tsx
  - src/components/ds/ArticleProse.stories.tsx
  - src/components/ds/PostLayout.stories.tsx
interaction: hitl
implementer: engineering/frontend-developer
---

## Objective
Compose the top-of-chain bespoke organisms (footer, article/prose, and `post-layout` composing molecules) and prove the article/prose layer consumes only the existing hardened MDX seam — the pack's one negative security obligation (FR-11).

## Implements
| Kind      | Ref                                                                 |
|-----------|---------------------------------------------------------------------|
| FR        | FR-5, FR-7, FR-11                                                    |
| Scenarios | bespoke-compositions-exist, compositions-compose-primitives, mdx-trust-seam-unchanged, owner-authored-rule-not-relaxed, sec-mdx-seam-untouched, sec-no-second-mdx-render-path |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | the remaining Figma non-primitive elements | built | footer, article/prose, and post-layout each exist as components, and post-layout composes the bespoke molecules/organisms rather than re-implementing them |
| 2 | the article/prose organism displays Post body content | implemented | it consumes only `mdxPresentation.tsx`'s already-hardened output, never re-parses raw MDX/HTML, and does not drop `rel="noopener noreferrer"` or bypass the `<script>`/`<iframe>` neutralizers |
| 3 | the MDX trust seam (`buildPostSet` slug gate + `mdxPresentation` hardening) | this pack lands | `src/data/postLoader.ts` and `src/utils/mdxPresentation.tsx` are byte-unchanged and no new MDX ingestion path is introduced (no `rehype-sanitize`/CSP obligation triggered) |
| 4 | each organism | stories are authored | a representative-content story exists under `Organisms/` |

## Approach
- Compose molecules (Task 005) and primitives (Task 004); `post-layout` is the `Bespoke → Bespoke` composition per design.md.
- Per design.md D-7 note and FR-11: the article/prose layer is a read-only consumer of `mdxPresentation.tsx` — verify with a git-diff assertion that the two seam files are unmodified.

## Implementation Log
