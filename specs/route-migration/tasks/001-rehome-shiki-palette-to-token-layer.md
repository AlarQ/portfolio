---
id: "001"
name: Re-home shiki palette to the token layer
status: implemented
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

- Added the 8 `--shiki-*` hues as ungrouped `tokens.ts` primitives (`shikiBg`,
  `shikiFg`, `shikiToken{Comment,Keyword,String,Constant,Function,Variable}`),
  with a source comment per ADR-RM-3 explaining why they're deliberately not
  routed through `semanticLight`/`semanticDark`. Regenerated `tokens.css` via
  `npm run generate:tokens` — no hand-edits.
- Deleted the hand-authored `--shiki-*` `:root` block from `globals.css`; the
  generated `tokens.css` is now the single emission point.
- Removed the now-dead `shikiVars` export (and its `brand`-sourced mapping)
  from `theme/theme.ts`. `brand` itself is untouched — every other `brand` key
  the shiki set drew from (`slate`, `skyLight`, `lime`, `orange`, `violet`,
  `slateLight`, `skyLighter`, `backgroundPaper`) still has live non-shiki
  consumers, so only the shiki-specific bridge object was removed.
- Repointed `shikiVars.test.ts` (not deleted, per D-9): it now imports
  `primitives` from `tokens.ts`, asserts `theme.ts` still exists (overlap
  window), and diffs the generated `tokens.css` `--shiki-*` declarations
  against the `tokens.ts` primitive source — never `brand`.
- Extended `e2e/blog-highlighting.spec.ts` with a third scenario
  (`built_post_code_block_background_resolves_from_shiki_vars_both_themes`):
  asserts the code block's computed background equals `--shiki-bg` both
  before and after toggling `.dark` on the root, proving the single
  dark-island set (OQ-2) doesn't drift across themes. Renamed the existing
  color-token comment to reflect the `tokens.ts`-sourced value (was `brand`).
- No backlog deviations. This is the first task on `feat/route-migration-integration`,
  so there is no prior-task test coverage to reconcile against; used the task
  file's `test_cases` as the behavior backlog directly (3 cases, all GREEN).
