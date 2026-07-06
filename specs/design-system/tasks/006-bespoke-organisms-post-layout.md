---
id: "006"
name: Bespoke organisms + post-layout (with MDX trust-seam guardrail)
status: implemented
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
pr_url: https://github.com/AlarQ/portfolio/pull/52
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

chunks_spawned: 2

Delegated to `engineering/frontend-developer` across 2 bounded-context chunks (K=3).

**Chunk 1** (test strategist backlog items 1-3):
- `mdxTrustSeam.test.ts` compares working-tree content of `src/data/postLoader.ts` and `src/utils/mdxPresentation.tsx` against their blob at `git merge-base HEAD feat/design-system`, asserting byte-unchanged — fails on uncommitted edits too, not only post-commit.
- `Footer.tsx`/`PostLayout.tsx` landed as minimal placeholders in this chunk (composition deferred to chunk 2).
- `ArticleProse.tsx` takes `{ post, children }` where `children` is Post body already compiled through `mdxComponents` from `mdxPresentation.tsx` (via the App Router's `useMDXComponents` hook) — zero MDX overrides, no parsing. Hardening verified end-to-end by constructing children via `mdxComponents.a`/`mdxComponents.script` and asserting `rel="noopener noreferrer"` / script-neutralization survive.

**Chunk 2** (backlog items 4-6, final):
- `ArticleProse.structure.test.ts` — source-level guard: no MDX-compiler-like imports, no `dangerouslySetInnerHTML`, no duplicated rel/neutralizer logic in `ArticleProse.tsx` (distinct from chunk 1's output-assertion test).
- `PostLayout.tsx` rewritten to compose AuthorInfo, PageInfo, ArticleProse, AdsSpace, Conclusion, Newsletter, Footer as composed children (author name is a placeholder literal — Post has no author field; deliberately not invented, out of scope).
- `Footer.stories.tsx`, `ArticleProse.stories.tsx`, `PostLayout.stories.tsx` added under `Organisms/` title path, using the real-Post fixture (`src/stories/fixtures/posts.ts`).
- Closing whole-diff refactor reviewed both chunks together — no duplication worth extracting; the two ArticleProse test files are intentionally complementary (output-level vs source-level), not duplicative. One `lint:fix` formatting pass applied.

`src/data/postLoader.ts` and `src/utils/mdxPresentation.tsx` confirmed untouched throughout (git diff empty on both files).

**Post-impl quality check** (frontend-developer + code-quality-pragmatist): overall verdict pass, no critical/high/medium findings. Two low-severity notes logged (not blocking, `/validate` may re-surface): (1) `Footer.tsx` carries a stale "no composition yet" comment despite being composed into `PostLayout` in this same diff; (2) `mdxTrustSeam.test.ts` shells out to `git merge-base HEAD feat/design-system` — will need updating once that branch is deleted post-merge (or CI must fetch it).
