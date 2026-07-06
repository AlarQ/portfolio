---
id: "003"
name: Token-purity lint gate (no-direct-palette-import) + Biome pin
status: done
blocked_by: ["002"]
max_files: 4
ground_rules:
  - style/general.md
  - security/deps-and-config.md
  - architecture/general.md
  - testing/principles.md
  - frontend/design-tokens.md
  - languages/typescript/type-safety.md
test_cases:
  - raw_hex_literal_in_component_fails_lint_and_names_file
  - palette_primitive_import_in_component_fails_lint
  - component_using_only_semantic_aliases_passes_lint
  - biome_version_pinned_not_caret_and_lockfile_committed
estimated_files:
  - biome.json
  - grit/no-direct-palette-import.grit
  - package.json
  - package-lock.json
interaction: afk
implementer: generalist
pr_url: https://github.com/AlarQ/portfolio/pull/49
---

## Objective
Make the semantic-only consumption rule (FR-3) a mechanical `npm run lint` failure and pin Biome so a routine upgrade cannot silently disable enforcement (ADR-DS-6).

## Implements
| Kind      | Ref                                                                 |
|-----------|---------------------------------------------------------------------|
| FR        | FR-3                                                                 |
| Scenarios | raw-hex-in-component-fails-lint, component-uses-semantic-only, sec-deps-pinned-and-locked |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | the `no-direct-palette-import` rule is active | a component introduces a raw hex literal or a `--brand-*`/`palette.*` primitive-layer import | `npm run lint` fails and names the offending file |
| 2 | a component referencing only semantic aliases (`--primary`, `--foreground`) | linted | it passes |
| 3 | the CSS-plugin breakage was version-specific (ADR-DS-6) | Biome is configured | the Biome version is pinned (not a caret range) in `package.json` and the lockfile is committed |

## Approach
- Implement per ADR-DS-6 as a **JS/TSX-language-only** GritQL rule (imports + property-value literals); do not attempt a `language css` rule (broken at Biome 2.4.15).
- Verify with a throwaway fixture component containing a raw hex → assert lint fails; remove the fixture or keep it as a guarded test asset.
- Pin Biome to the version verified against the JS-language GritQL plugin. NOTE: the repo is already on `@biomejs/biome` `2.3.14` pinned exact (below the 2.4.15 CSS-plugin breakage) — this acceptance is largely satisfied; verify GritQL JS-language plugin support exists on 2.3.14 during the spike before relying on `grit/no-direct-palette-import.grit`.

## Implementation Log
- Added `grit/no-direct-palette-import.grit`, a JS/TSX-language GritQL Biome plugin rule wired into `biome.json` (top-level `plugins`, not `overrides.plugins` — confirmed non-functional at 2.3.14). Bans: (1) raw hex literals outside `src/theme/{theme,tokens}.ts` and `scripts/generate-tokens.ts`, (2) named imports of `primitives` from `theme/tokens`, (3) namespace imports (`import * as x from "theme/tokens"`) — closes an escape hatch where a namespace import could reach `x.primitives` without the literal identifier `primitives` appearing in the import statement text.
- The pre-existing MUI `brand` seam (`theme/theme.ts`) is intentionally untouched — out of scope per `CLAUDE.md`'s existing endorsed presentation-seam pattern.
- Confirmed repo-wide zero false positives before wiring in (`npm run lint` clean, no existing hex literals outside theme/ or `theme/tokens` imports outside `scripts/generate-tokens.ts`).
- Tests in `src/theme/lintGate.test.ts` spawn the real `biome` binary against sandboxed fixture files (same `mkdtempSync` idiom as `tokens.test.ts`/`buildGate.test.ts`), covering all 4 `test_cases` plus two regression cases from code-quality review: a false-positive guard (identifier merely containing the substring `primitives`) and the namespace-import closure.
- Biome pin (`2.3.14`, exact) and committed lockfile were already satisfied from task 002; only a test was added.
- Gotcha for future grit rules: a `\b` (word-boundary) regex assertion inside a grit `where`-clause regex silently fails plugin compilation ("Failed to compile the Grit plugin", no further detail) on Biome 2.3.14 — use a character-class boundary (`[^a-zA-Z]`) instead.
