---
id: "008"
name: Light + dark theming on the semantic layer
status: blocked
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
