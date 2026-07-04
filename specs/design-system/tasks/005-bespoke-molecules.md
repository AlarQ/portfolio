---
id: "005"
name: Bespoke molecules + their stories
status: blocked
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
