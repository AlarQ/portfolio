---
id: "002"
name: Storybook-first status-dot, tab-pill, meter atoms with meter progress tokens
status: in-progress
blocked_by: []
max_files: 11
ground_rules:
  - frontend/components.md
  - frontend/design-tokens.md
  - frontend/accessibility.md
  - frontend/styling.md
  - languages/typescript/type-safety.md
  - testing/structure.md
test_cases:
  - status_dot_binds_only_semantic_tokens_a11y_passes_both_themes
  - tab_pill_is_dumb_no_tablist_or_roving_tabindex_logic
  - meter_fill_uses_bg_primary_not_status_hue
  - meter_shows_progress_legend_label_at_0_mid_100
  - two_new_dimension_tokens_regenerated_freshness_test_passes
  - each_atom_has_sibling_story_lint_stories_green
estimated_files:
  - src/components/ui/status-dot.tsx
  - src/components/ui/status-dot.stories.tsx
  - src/components/ui/tab-pill.tsx
  - src/components/ui/tab-pill.stories.tsx
  - src/components/ui/meter.tsx
  - src/components/ui/meter.stories.tsx
  - src/components/ui/meter.test.tsx
  - src/theme/tokens.ts
  - src/theme/tokens.css
interaction: afk
implementer: engineering/frontend-developer
---

## Objective
Add three dumb `ui/` primitives (`status-dot`, `tab-pill`, `meter`) with sibling stories covering meaningful states in both themes, plus exactly two new semantic dimension tokens in `tokens.ts` (regenerated into `tokens.css`) that the `meter` consumes — so the organisms have token-bound, story-verified building blocks.

## Implements
| Kind      | Ref               |
|-----------|-------------------|
| FR        | FR-6, FR-10       |
| Contract  | —                |
| Data      | `TechKey`         |
| Scenarios | meter-legend-label |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | the `status-dot` atom | rendered across its `StatusTone` variants in Storybook | each tone binds only semantic Tailwind utilities (no hex, no `primitives` import, no arbitrary-value color) and passes the a11y panel in light and dark |
| 2 | the `tab-pill` atom | rendered selected and unselected | it is a dumb pill with no tablist/roving-tabIndex logic (that lives in the organism) and reflects selected state visually |
| 3 | the `meter` atom at 0, a mid value, and 100 | rendered | the fill uses `bg-primary` (NOT a status hue) and a visible legend/label frames the value as progress to first usable release |
| 4 | the meter needs new spacing/size dimensions | `tokens.ts` adds exactly two new semantic dimension aliases and `generate:tokens` runs | `tokens.css` is regenerated and the `tokens.test.ts` freshness test passes (no hand-edit) |
| 5 | any of the three components | `lint:stories` runs | each has a sibling `*.stories.tsx` and the commit is not blocked |

## Approach
- Follow the `badgeVariants.ts` precedent: `status-dot` owns the `StatusTone` variant union + token-bound styling (the seam in Task 003 maps `Status → StatusTone`).
- Taxonomy `Atoms/…`; the two new dimension aliases resolve to primitive *names* via `satisfies`, then `npm run generate:tokens` regenerates `tokens.css` (never hand-edit).
- Atoms stay dumb — no data, no seam, no ARIA tablist logic (that is Task 003's organism).

## Implementation Log
