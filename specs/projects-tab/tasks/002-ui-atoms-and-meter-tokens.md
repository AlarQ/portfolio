---
id: "002"
name: Storybook-first status-dot, tab-pill, meter atoms with meter progress tokens
status: done
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
pr_url: https://github.com/AlarQ/portfolio/pull/80
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

chunks_spawned: 2

- `StatusTone = "muted" | "info" | "success"` in `src/components/ui/statusDotVariants.ts` (cva, follows `badgeVariants.ts`'s exhaustive-array-drives-union precedent). Chose these 3 because spec.md's `Status` domain is `exploring | in-progress | shipped`; `exploring` resolves to `muted`, `in-progress`/`shipped` cover `info`/`success`. Actual `Status → StatusTone` mapping is deferred to Task 003's seam. Tones bind existing semantic tokens only (`bg-muted-foreground`, `bg-badge-sky-fg`, `bg-badge-green-fg`) — no new color tokens needed.
- `tab-pill` is a plain `<span>` + local `cva`; `selected` prop toggles `bg-primary`/`bg-secondary`. No ARIA tablist/roving-tabIndex logic (reserved for Task 003's organism).
- `meter` renders a `data-slot="meter-group"` wrapper containing a `<div role="progressbar">` track (switched from `role="meter"` after biome's `useSemanticElements` flagged it) with a `bg-primary` fill sized via `style={{width}}`, plus a `data-slot="meter-legend"` `<p>` rendering `"{clamped}% to first usable release"`. `className` prop applies to the group wrapper (not the track) to keep the atom's sizing API stable. Exported pure helper `clampMeterValue` (0–100 clamp) as an independently-testable seam, verified via `react-dom/server`'s `renderToStaticMarkup` (`@testing-library/react` is not installed in this repo).
- Exactly two new semantic dimension tokens added to `tokens.ts`: primitives `meterTrackHeight: "8px"` / `spaceMeterLegendGap: "6px"`, semantic aliases `--spacing-meter-track` / `--spacing-meter-legend-gap` (both `satisfies Record<string, DimensionPrimitiveName>`), consumed in `meter.tsx` as `h-meter-track` / `mt-meter-legend-gap`. `tokens.css` regenerated via `npm run generate:tokens` (never hand-edited); `tokens.test.ts` freshness check passes.
- `lint:stories` confirmed green for all three atoms. Full suite (type-check, lint, lint:stories, 273 unit tests) green throughout both chunks. Refactor pass found no duplication worth extracting across the three atoms — each is small and single-concern, consistent with `badgeVariants.ts`.
- 2026-07-12 — status-dot a11y addon panel verification (coverage-1) ATTEMPTED in light and dark but BLOCKED — evidence NOT obtained. `@storybook/addon-a11y` (10.4.6) IS configured in `.storybook/main.ts` and installed. Storybook manager UI served (HTTP 200; sidebar, StatusDot/All Tones story, and Accessibility tab all rendered), but the story-preview iframe webpack bundle never finished compiling — stuck at `38% building` with a recurring `Unhandled Rejection: TypeError: Cannot read properties of undefined (reading 'length')`, reproduced across two fresh `npm run storybook` instances (Node v26.4.0; cf. MEMORY note on Node 26 toolchain hangs). `iframe.html?id=atoms-statusdot--all-tones` timed out (HTTP 000). Consequently the a11y panel stayed on "Preparing accessibility scan / Please wait while the addon is initializing…" in both themes and produced NO violation counts for tones muted/info/success. No clean result is being claimed — the panel could not be read. The coverage-1 finding remains accepted as unautomatable (no axe/testing-library dep in-repo); this manual check is documented as blocked pending a working Storybook preview build.
