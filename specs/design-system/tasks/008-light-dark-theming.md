---
id: "008"
name: Light + dark theming on the semantic layer
status: implemented
blocked_by: ["002", "004", "005", "006"]
max_files: 4
ground_rules:
  - style/general.md
  - architecture/general.md
  - frontend/design-tokens.md
  - frontend/accessibility.md
  - testing/principles.md
test_cases:
  - dark_class_swaps_semantic_tokens_and_components_rerender
  - dark_palette_is_single_dark_block_sourced_from_figma_dark_frame
  - no_component_requires_per_theme_code_change
estimated_files:
  - src/theme/tokens.ts
  - src/theme/tokens.css
  - .storybook/preview.tsx
  - src/theme/ThemeProvider.tsx
interaction: afk
implementer: engineering/frontend-developer
pr_url: https://github.com/AlarQ/portfolio/pull/54
---

## Objective
Ship dark as a single semantic-layer token block pixel-matched from the real Figma dark frame (node `614:679`), proving components need zero per-theme change because they bind only to semantic aliases (FR-9).

## Implements
| Kind      | Ref                                              |
|-----------|--------------------------------------------------|
| FR        | FR-9                                             |
| Scenarios | theme-toggles-light-dark, dark-is-single-token-block |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | `next-themes` with the class strategy registering light and dark | the active theme toggles | the `.dark` class swaps the semantic token values and components re-render in the new theme |
| 2 | components bind only to semantic aliases | dark theme is added | the entire dark palette is one `.dark {}` token block sourced from the Figma dark frame (node `614:679`: bg `#090d1f`, heading white, body `#c0c5d0`, byline accent `#6941c6`), and no component requires a per-theme code change |

## Approach
- Per ADR-DS-5: map the observed Figma dark-frame values (node `614:679`) onto the same semantic alias names the light Figma theme populates — not derived from `theme.ts`'s `brand.sky/lime/orange`, no algorithmic inversion.
- Add a Storybook theme toggle to demo both themes; verify no component diff is required to support dark.

## Implementation Log

chunks_spawned: 2

- Chunk 1 (behaviors 1-3): Added dark-frame primitives to `src/theme/tokens.ts` (`backgroundDark #090d1f`, `headingDark #ffffff`, `bodyDark #c0c5d0`, `accentBylineDark #6941c6` — plain hex literals, never ramp-derived, per ADR-DS-7). Populated `semanticDark` with the same 4 alias names as `semanticLight` (`--background`, `--foreground`, `--muted-foreground`, `--accent`) — other aliases cascade from `:root` naturally since `.dark` is a class on `<html>`. Regenerated `tokens.css` via `npm run generate:tokens` (never hand-edited). Mounted `next-themes`' `ThemeProvider` (`attribute="class"`, `defaultTheme="light"`, `enableSystem={false}`) in `src/theme/ThemeProvider.tsx`, decoupled from `MuiThemeProvider`/`CssBaseline`. New tests: `src/theme/darkTheme.test.tsx` (real jsdom DOM toggle test reading CSS custom properties via `getComputedStyle` — jsdom can't resolve `var()` in shorthand props), `src/theme/ThemeProvider.test.tsx` (mounts via `react-dom/client`, toggles via `useTheme()`, needed a scoped `matchMedia` polyfill for jsdom).
- Chunk 2 (behaviors 4-6, final): Added a Storybook theme toolbar toggle (`globalTypes.theme`) in `.storybook/preview.tsx`; the existing font-wrapper decorator conditionally appends `.dark` based on `context.globals.theme`. Dropped the stale `backgrounds.values` dark swatch (legacy MUI `brand.backgroundDefault #0a1118`) rather than updating it, to avoid two competing dark definitions — the toolbar class-swap is now the single mechanism. Extended `src/storybook-tooling/previewThemeDecorator.test.tsx` with toggle assertions. New `src/theme/noComponentChange.test.ts` mechanically proves FR-9 acceptance #2 (zero `src/components/**` files changed) by diffing `feat/design-system` against the working tree + untracked files (a `HEAD`-only diff would pass trivially since work wasn't yet committed). Verified chunk-1's `dark_primitives_are_hand_pinned_literals_not_ramp_derived` test already covers all 4 new primitives — no extension needed. No whole-diff refactor needed at close: the 3 budgeted source-file diffs were small and non-duplicative.
- Full suite: 207 passed / 1 skipped, lint clean, type-check clean. `max_files: 4` respected exactly (tokens.ts, tokens.css, ThemeProvider.tsx, preview.tsx).
- Post-implementation quality check (code-quality-pragmatist): flagged `src/theme/noComponentChange.test.ts` (high severity) — the git-diff-against-`feat/design-system` check was a one-time acceptance proof, not a safe permanent CI test (would go vacuous or flaky once this branch merges/is deleted). Deleted the file; the acceptance claim it proved is already recorded above. Full suite re-verified green after removal (206 passed / 1 skipped, lint clean, type-check clean).
