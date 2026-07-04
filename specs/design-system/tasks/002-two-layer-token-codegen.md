---
id: "002"
name: Two-layer token codegen (tokens.ts → @generated tokens.css)
status: blocked
blocked_by: ["001"]
max_files: 6
ground_rules:
  - architecture/general.md
  - style/general.md
  - languages/typescript/type-safety.md
  - testing/principles.md
  - security/authz.md
  - security/secrets.md
  - frontend/design-tokens.md
test_cases:
  - generate_tokens_twice_emits_byte_identical_css
  - generated_css_carries_at_generated_banner
  - tokens_ts_has_distinct_primitive_and_semantic_maps
  - every_semantic_alias_resolves_to_a_primitive_not_inline_hex
  - regenerate_overwrites_hand_edited_tokens_css
  - codegen_output_path_is_hardcoded_literal
  - codegen_fails_fast_if_resolved_path_outside_src_theme
  - tokens_ts_references_no_env_or_credential
  - emitter_is_dark_aware_light_to_root_dark_to_dark_block
estimated_files:
  - src/theme/tokens.ts
  - scripts/generate-tokens.ts
  - src/theme/tokens.css
  - src/theme/tokens.test.ts
  - package.json
  - src/app/globals.css
interaction: afk
implementer: generalist
---

## Objective
Establish the single token source of truth (primitive palette → semantic aliases) and a path-safe, deterministic `generate:tokens` codegen that emits `@generated tokens.css`, so the whole system consumes one auditable seam.

## Implements
| Kind      | Ref                                                                 |
|-----------|---------------------------------------------------------------------|
| FR        | FR-2                                                                 |
| Scenarios | tokens-codegen-deterministic, tokens-two-layer-shape, generated-css-not-hand-edited, sec-codegen-path-safety, sec-no-secrets-in-tokens-or-fixtures |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | `tokens.ts` is unchanged | `npm run generate:tokens` runs twice | both runs emit byte-identical `tokens.css` carrying an `@generated` banner (no timestamps / random ordering) |
| 2 | the TS token source | inspected | a primitive palette map and a semantic alias map exist as distinct exports, and every semantic alias resolves to a primitive, never to an inline hex |
| 3 | the `@generated tokens.css` | a developer hand-edits it and re-runs `generate:tokens` | the codegen overwrites the manual edit |
| 4 | the `generate:tokens` script writes output | it runs | the output path is a hardcoded literal (never derived from env/CLI/external input) and it fails fast if the resolved path is outside `src/theme/` |
| 5 | `tokens.ts` is authored | committed | no `.env` value, API key, or credential is referenced |
| 6 | the emitter supports theme blocks | it runs | it emits a dark-aware block structure (light → `:root`, dark → `.dark {}`) from the start, even if the dark values are empty until Task 008 fills them — so 008 is a pure token-value edit, never a generator change or a hand-edit of `tokens.css` |

## Approach
- Model per ADR-DS-3: two exported maps mirroring the existing `brand` seam; hex per ADR-DS-7 (no OKLCH; primary 50–900 ramp synthetically generated from the single observed `#7F56D9` sample, all other hexes hand-pinned from observed Figma nodes); include the dark-mode-only `--primary-strong` (`#A082E3`) escape hatch and an ADR-DS-4 rationale comment near `--primary`.
- Build the emitter dark-aware now (light → `:root`, dark → `.dark`), even with empty dark values, so Task 008 only edits token values and re-runs `generate:tokens` (never touches the generator or hand-edits `tokens.css`).
- Bridge with Tailwind v4 `@theme inline`; order `@import` so `tokens.css` loads before utility layers.
- Enforce `sec-codegen-path-safety`: literal output path, fail-fast bounds check that the resolved path is inside `src/theme/`.

## Implementation Log
