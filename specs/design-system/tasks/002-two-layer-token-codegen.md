---
id: "002"
name: Two-layer token codegen (tokens.ts → @generated tokens.css)
status: done
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
pr_url: https://github.com/AlarQ/portfolio/pull/48
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

### 2026-07-05 — implemented (inline TDD)

**Shape.** `src/theme/tokens.ts` is the hand-authored two-layer source: `primitives`
(Layer 1, hex) + `semanticLight`/`semanticDark` (Layer 2). Semantic aliases are
typed `keyof typeof primitives` (`PrimitiveName`), so an alias can only point at a
primitive *name* — an inline hex or an unbacked alias is a compile error, not a
runtime CSS gap (acceptance #2, enforced by both `tsc` and the runtime test).

**Codegen.** `scripts/generate-tokens.ts` exposes pure `emitTokensCss()` +
`assertInsideThemeDir()` + `writeTokensCss()`, with the disk write behind
`import.meta.main` so importing the module in vitest never writes. Runs under
**Node v26 native TS strip** (`node scripts/generate-tokens.ts`) — no `tsx`/`ts-node`
dependency added (sec-deps-pinned-and-locked). Emitter is deterministic (object
key order is the only ordering; no timestamps/env), so repeated runs are
byte-identical (acceptance #1). Added `tsconfig.allowImportingTsExtensions` so
`tsc` accepts the `.ts` import extension Node's runtime requires.

**Path safety.** Output path is the hardcoded literal `"src/theme/tokens.css"`
(never env/CLI). `assertInsideThemeDir` fails fast on any resolved path outside
`<root>/src/theme` — covers `..` traversal and absolute escapes (acceptance #4).

**Dark-aware now.** Emitter always emits a `.dark {}` block even though
`semanticDark` is `{}` (acceptance #6, ADR-DS-5). Task 008 is therefore a pure
token-value edit (fill `semanticDark` + add dark-frame primitives) + a
`generate:tokens` re-run — never a generator change or a `tokens.css` hand-edit.

**Token content (ADR-DS-7).** Primary 50–900 ramp is synthetically generated by
HSL-lightness interpolation from the single observed sample `#7f56d9`, with 600
pinned to the exact hex for pixel fidelity. `--primary-strong` (`#a082e3`,
ADR-DS-4 dark escape hatch) + light/shared neutrals hand-pinned. Dark-frame hues
(`#090d1f`/`#c0c5d0`) deferred to 008 per test-strategy `must_not_test`.

**CSS wiring (ADR-DS-3).** `globals.css` `@import "../theme/tokens.css"` loads
before the Tailwind utility layer. The `@theme inline` bridge is **emitted into
`tokens.css`** (auto-tracks the alias set) rather than hand-authored in
`globals.css` — this also keeps biome from parsing the Tailwind-specific `@theme`
directive. Generated `tokens.css` is excluded from biome (generated artifact).
Removed the now-stale hardcoded `--background`/`--foreground` (+ their
`prefers-color-scheme` override) from `globals.css`; those values now flow from
the token seam (dark via the class-strategy `.dark` block, 008).

**Gates.** `generate:tokens` (deterministic), `type-check`, `lint`,
`test:unit` (9 new + 90 existing pass, 1 pre-existing skip), and `build` (SSG,
7/7 pages) all green.

**Post-impl quality review (`code-quality-pragmatist`).** Applied:
- The `regenerate_overwrites_hand_edited_tokens_css` test now writes a real
  sentinel hand-edit in an OS-tmp sandbox root and asserts it is clobbered —
  previously it wrote twice with no edit and mutated the tracked `tokens.css`.
- Clarified the `primaryRamp` lightness table (600 sentinel `0`; stops are
  approximations, only 600 observed).

Reviewed and deliberately kept: removing the `prefers-color-scheme` dark
override from `globals.css` is intentional — dark is now the class-strategy
`.dark` block (001 wired `next-themes`; 008 fills values per FR-9), and this
branch stacks on `feat/design-system`, never shipping to prod before 008. The
`assertInsideThemeDir` defense-in-depth check is kept as a security guard.
