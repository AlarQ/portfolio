---
id: "005"
name: Bespoke molecules + their stories
status: done
blocked_by: ["004"]
max_files: 13
ground_rules:
  - style/general.md
  - architecture/general.md
  - languages/typescript/react-patterns.md
  - testing/principles.md
  - frontend/components.md
test_cases:
  - bespoke_molecules_each_exist_as_components
  - molecule_composes_primitives_not_reimplemented
  - molecule_binds_only_to_semantic_layer_passes_purity_lint
  - each_molecule_has_representative_content_story_under_molecules
  - owns_shared_real_post_fixture_typed_as_real_post_from_posts_module
estimated_files:
  - src/components/ds/PostCard.tsx
  - src/components/ds/Newsletter.tsx
  - src/components/ds/AuthorInfo.tsx
  - src/components/ds/PageInfo.tsx
  - src/components/ds/Conclusion.tsx
  - src/components/ds/AdsSpace.tsx
  - src/components/ds/PostCard.stories.tsx
  - src/components/ds/Newsletter.stories.tsx
  - src/components/ds/AuthorInfo.stories.tsx
  - src/components/ds/PageInfo.stories.tsx
  - src/components/ds/Conclusion.stories.tsx
  - src/components/ds/AdsSpace.stories.tsx
  - src/stories/fixtures/posts.ts
interaction: hitl
implementer: engineering/frontend-developer
pr_url: https://github.com/AlarQ/portfolio/pull/51
---

## Objective
Compose the smaller Figma-specific elements (post card, newsletter, author-info, page-info, conclusion, ads-space) from atoms/primitives, binding only to the semantic layer, each demoable via a representative-content Storybook story.

## Implements
| Kind      | Ref                                                                 |
|-----------|---------------------------------------------------------------------|
| FR        | FR-5, FR-7                                                           |
| Scenarios | bespoke-compositions-exist, compositions-compose-primitives, component-uses-semantic-only, sidebar-atomic-design-order |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | the Figma design's non-primitive molecule elements | the bespoke set is built | post card, newsletter, author-info, page-info, conclusion, and ads-space each exist as components |
| 2 | a bespoke molecule (e.g. a post card) | implemented | it composes atoms/shadcn primitives rather than re-implementing them and binds only to the semantic token layer |
| 3 | each molecule | linted | no raw hex, `--brand-*` primitive, or `palette.*` lookup appears (passes `no-direct-palette-import`) |
| 4 | each molecule's stories | authored | a representative-content story exists under `Molecules/` |
| 5 | PostCard is the earliest consumer of Post-shaped data | the shared fixture is authored | `src/stories/fixtures/posts.ts` is created here, typed against the real `Post` from `src/data/posts.ts`; 006 and 007 import it forward and never recreate it (propagates the FR-8 compile-error guardrail upstream) |

## Approach
- Compose Task 004's restyled primitives; no re-implementation (design.md `Bespoke → Primitives` one-way edge).
- Representative-content stories (not exhaustive matrices — that's atoms-only per FR-7).
- OWN the shared real-`Post` fixture: create `src/stories/fixtures/posts.ts` typed against the real `Post` from `src/data/posts.ts` (do not modify the type — FR-11). This is the single Post fixture; 006/007 import it, never invent ad-hoc Post shapes.

## Implementation Log

chunks_spawned: 3

**Chunk 1 (fixture + PostCard + AuthorInfo):**
- Interface: `PostCard` takes a single `post: Post` prop (not destructured fields) per user confirmation. `AuthorInfo` takes minimal props `{ name, title?, avatarSrc?, fallback }` — renamed the initial `role` prop to `title` because Biome's `useValidAriaRole` a11y rule flagged a JSX prop literally named `role` as an (invalid) ARIA role attribute; `title` avoids the false-positive and reads just as well semantically.
- `PostCard` wraps `next/link`'s `Link` around the shadcn `Card` (rather than giving `Card` an `asChild`/polymorphic prop, since Task 004's `Card` primitive has no `asChild` support and modifying it was out of scope).
- Both molecules bind only to semantic Tailwind classes — zero raw hex/palette imports; `npm run lint` passes clean including `no-direct-palette-import`.
- Tests follow the existing repo convention (`createRoot` + `act`, as in `previewThemeDecorator.test.tsx`) since `@testing-library/react` isn't a project dependency — no new dependency added.
- Fixture `src/stories/fixtures/posts.ts` exports both `samplePost` (single) and `samplePosts` (array) typed against the real `Post`.

**Chunk 2 (PageInfo + Conclusion + Newsletter):**
- `PageInfo`: props `{ formattedDate: string; readingTimeMinutes: number; category?: string }` — reused `Post`'s existing field names, composed shadcn `Badge` for reading time + optional category, plain `<time>` for the date.
- `Conclusion`: props `{ heading, body, ctaLabel?, ctaHref? }` — CTA composes shadcn `Button` with `asChild` wrapping a `next/link` `Link` (same pattern as PostCard's link usage), CTA optional (renders only when both label and href given).
- `Newsletter`: props `{ heading, description?, ctaLabel? }` (default `"Subscribe"`) — composes shadcn `Input` (type=email) + `Button` inside a plain `<form>`, no submit handler wired (out of scope).
- All three use `data-slot="badge"|"button"|"input"` selectors in tests, matching existing primitive markup.

**Chunk 3 (AdsSpace + whole-diff refactor + final acceptance sweep):**
- `AdsSpace`: zero-prop presentational placeholder per explicit user confirmation (no `slotId`/`variant` — YAGNI, no ad-network wiring). Composes shadcn `Card`/`CardContent` with `border-dashed`, renders literal `"Advertisement"` text.
- Refactor: read the full task diff (662 lines). Found the `renderIntoDocument` DOM-mount test helper (+ `IS_REACT_ACT_ENVIRONMENT` bootstrap) copy-pasted verbatim across all 6 `.test.tsx` files — extracted to `src/components/ds/testUtils.tsx`, all 6 test files updated to import it. No other cross-molecule duplication reached the 3+ threshold (Card usage differs meaningfully between PostCard and AdsSpace; the CTA-via-asChild+Link pattern appears only once in Conclusion, so left alone).
- Final acceptance sweep — all passing:
  - `npm run lint`: zero violations (incl. `no-direct-palette-import`) across all 6 molecules + fixture + testUtils.
  - `npm run type-check`: clean, confirms `posts.ts` fixture type-checks against the real `Post`.
  - All 6 molecules have exactly one `Default` story each, titled `Molecules/<Name>` — matches Task 004's sidebar convention.
  - `PostCard.stories.tsx` imports `samplePost` from `@/stories/fixtures/posts` (not an inline object).
  - `npx vitest run`: 175 passed / 1 skipped, no regressions anywhere in the repo.
