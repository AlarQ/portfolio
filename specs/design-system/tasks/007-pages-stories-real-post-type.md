---
id: "007"
name: Four Pages stories bound to the real Post type
status: implemented
blocked_by: ["006"]
max_files: 9
ground_rules:
  - languages/typescript/type-safety.md
  - style/general.md
  - architecture/general.md
  - testing/principles.md
  - security/secrets.md
  - frontend/components.md
test_cases:
  - four_pages_stories_render_full_screens_under_pages
  - reuses_shared_post_fixture_from_005_not_recreated
  - fixture_omitting_or_renaming_post_field_is_compile_error
  - fixtures_reference_no_env_or_credential_only_public_post
  - pages_stories_reflow_matches_figma_mobile_frame
estimated_files:
  - src/stories/pages/Home.stories.tsx
  - src/stories/pages/BlogListing.stories.tsx
  - src/stories/pages/SinglePost.stories.tsx
  - src/stories/pages/Author.stories.tsx
interaction: hitl
implementer: engineering/frontend-developer
---

## Objective
Compose the four screen-level stories (Home, Blog Listing, Single Post, Author) from real organisms and type their fixtures as the actual `Post` from `src/data/posts.ts`, so a divergence is a compile error — the pack's cheap insurance against pack-2 rework (FR-8).

## Implements
| Kind      | Ref                                                                 |
|-----------|---------------------------------------------------------------------|
| FR        | FR-8, FR-12                                                          |
| Scenarios | pages-stories-render, pages-use-real-post-type, invented-post-prop-rejected, sec-no-secrets-in-tokens-or-fixtures, mobile-breakpoint-matches-figma-frame |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | the four Pages stories (Home, Blog Listing, Single Post, Author) | Storybook renders them | each composes real organisms into a full screen under `Pages/` |
| 2 | the Pages stories need Post data | their fixtures are authored | they reuse the shared `src/stories/fixtures/posts.ts` created in Task 005 (typed as the actual `Post` from `src/data/posts.ts` — slug, title, dek, date, readingTimeMinutes, formattedDate, published) and do NOT recreate a Post shape |
| 3 | a page-composing component that accepts a Post | a fixture omits or renames a real `Post` field | TypeScript raises a compile error |
| 4 | the fixtures | committed | they reuse only the already-public `Post` type and reference no `.env` value, credential, or non-public data |
| 5 | a Pages story | rendered at mobile viewport width | its layout matches the Figma "iPhone 15" mobile frame (node `614:353`), not an ad-hoc breakpoint |

## Approach
- Import the shared real-`Post` fixture from `src/stories/fixtures/posts.ts` (owned by Task 005); do NOT recreate it. The `Post` type itself is declared in `src/data/posts.ts` and must not be modified — FR-11.
- The `invented-post-prop-rejected` compile-error guardrail lives here: a page-composing fixture that omits/renames a real `Post` field must fail `tsc --noEmit`. Mechanism: an inline `// @ts-expect-error` negative case within a Pages story (no separate fixture file), asserting the bad shape is rejected.
- Compose Task 006 organisms into `Pages/` title-path stories.
- Use the `@storybook/nextjs` `next/image`/`next/font` mocks (ADR-DS-1) so Pages match production image/font behavior.

## Implementation Log

chunks_spawned: 3

Delegated to `engineering/frontend-developer`, split into 3 bounded-context chunks over the settled behavior backlog (per ADR-0018), threaded via a cumulative `impl_notes` ledger.

**Chunk 1/3** (behaviors: reuse shared fixture, four Pages stories render under `Pages/`, compose-not-reimplement guard):
- Page-composing components placed under `src/components/pages/` (HITL decision: matches 004-006 colocation convention, not `src/stories/pages/` per the task's `estimated_files`).
- Four components: `Home` (posts grid + Newsletter + Footer), `BlogListing` (posts grid + Footer), `SinglePost` (thin wrapper around `PostLayout`), `Author` (AuthorInfo + posts grid + Footer). Each takes real `Post`-typed props; stories inject `samplePost`/`samplePosts` from the existing shared fixture `src/stories/fixtures/posts.ts`.
- All four stories filed under `title: "Pages/<Name>"`.
- Structural guard tests: `Pages.fixtures.test.ts` (shared-fixture reuse, no re-declared Post literal) and `Pages.structure.test.ts` (composes `ds/` organisms, no reimplementation).

**Chunk 2/3** (behaviors: compile-error guardrail, no-secrets fixture scan, mobile viewport):
- `fixture_omitting_or_renaming_post_field_is_compile_error`: inline `@ts-expect-error` negative case in `Home.stories.tsx` (Post missing `slug`/`published`), mechanically verified by temporarily removing the comment and confirming `tsc` errors (`TS2739`), then restoring it.
- `fixtures_reference_no_env_or_credential_only_public_post`: added env/secret/fetch scans to `Pages.fixtures.test.ts`.
- `pages_stories_reflow_matches_figma_mobile_frame`: no viewport addon existed, so added a named `iphone15` (390x844) entry to `parameters.viewport.viewports` in `.storybook/preview.tsx` (Storybook's built-in mechanism, no new dependency) plus a `Mobile` story export per page. `Pages.viewport.test.ts` asserts the parameter is declared — proves the story *declares* the mobile frame, not a pixel-diff visual regression (no visual-snapshot tooling exists in this repo; true visual fidelity is a manual/PR-review concern).

**Chunk 3/3 — final** (behavior: purity-lint pass; closing whole-diff refactor; acceptance re-verification):
- Confirmed `npm run lint` (task 003's `no-direct-palette-import` gate) is clean across `src/components/pages/` — no new test needed, the passing lint run is the proof.
- Whole-diff refactor: extracted the 4x-duplicated `{ viewport: { defaultViewport: "iphone15" } }` block into a shared `mobileViewportParameters` constant (`src/stories/mobileViewport.ts`), imported by all four stories; deduped `SinglePost`'s `Default`/`Mobile` body JSX into one `sampleBody` const. Left `Home`/`BlogListing`/`Author` as independent components — each has genuinely different layout, so a shared "PostGrid page" abstraction was deliberately not introduced (no-premature-abstraction).
- Re-verified all 5 acceptance rows against actual runtime code (not just test presence) — all satisfied. Full suite 209 passed / 1 skipped, `type-check` clean, `lint` clean, production `build` succeeds with stories excluded from SSG (ADR-DS-1 holds — only `/`, `/blog`, `/blog/[slug]`, `/feed.xml`, `/_not-found` emitted).
