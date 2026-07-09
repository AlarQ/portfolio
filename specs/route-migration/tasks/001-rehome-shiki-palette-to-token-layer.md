---
id: "001"
name: Re-home shiki palette to the token layer
status: in-progress
blocked_by: []
max_files: 5
ground_rules:
  - frontend/design-tokens.md
  - architecture/general.md
test_cases:
  - shikivars_test_passes_against_tokens_source_with_theme_ts_still_present
  - tokens_css_freshness_guard_passes_after_regeneration
  - built_post_code_block_background_resolves_from_shiki_vars_both_themes
estimated_files:
  - src/theme/tokens.ts
  - src/theme/tokens.css
  - src/theme/shikiVars.test.ts
  - src/app/globals.css
  - src/theme/tokens.test.ts
interaction: afk
implementer: generalist
---

## Objective
Move the `--shiki-*` palette from `theme/theme.ts` `brand` (and its hand-edited `globals.css` mirror) into `tokens.ts` primitives regenerated into `tokens.css`, repointing `shikiVars.test.ts`, so build-time highlighting survives the eventual `theme.ts` deletion (FR-8, Risk R-2).

## Implements
| Kind      | Ref                                      |
|-----------|------------------------------------------|
| FR        | FR-8                                     |
| Contract  | —                                        |
| Data      | —                                        |
| Scenarios | code-block-highlighted |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | shiki colors added as ungrouped primitives in `tokens.ts` (ADR-RM-3, with the no-light-variant comment) | `npm run generate:tokens` runs | `tokens.css` emits the full `--shiki-*` set; no hand-authored shiki block remains in `globals.css` |
| 2 | `theme/theme.ts` still exists (overlap window) | the repointed `shikiVars.test.ts` runs pre-push | it asserts the emitted vars equal the `tokens.ts` primitive source — not `brand` — and passes |
| 3 | a Post body with a fenced code block | the site builds | shiki emits static highlighted HTML whose colors resolve from token-layer `--shiki-*` vars, rendered as a dark island in both themes (OQ-2) |
| 4 | the `tokens.css` freshness guard | `tokens.test.ts` runs | committed CSS matches the regenerated source (never-hand-edit invariant holds) |

## Approach
- ADR-RM-3: shiki set as named `tokens.ts` primitives, deliberately not routed through `semanticLight`/`semanticDark`; regenerate, never hand-edit `tokens.css`.
- Delete the mirrored `--shiki-*` block from `globals.css`; the generated `tokens.css` becomes the single emission point.
- Repoint (do not delete) `shikiVars.test.ts` per D-9 so premature `theme.ts` deletion fails CI immediately (mitigates R-2).

## Implementation Log
