# Test Strategy — `design-system`

## Test Strategy Overview

Verification for this pack is dominated by **four non-runtime gate types** — Storybook render (visual, hitl-reviewed), TypeScript compile-error assertions (`tsc --noEmit`), the purity **lint-gate** (`npm run lint`), and **deterministic codegen** diffing — plus exactly **two runtime integration seams** worth an e2e/git-diff (FR-1 coexistence no-regression; FR-11 MDX seam byte-unchanged) and **one build-output pre-push gate** (FR-10 Storybook prod-exclusion; Actions is deploy-only). The organizing principle: each mechanical guarantee has **one owning task** (codegen determinism → 002, purity lint rule → 003, Post-type compile guardrail → 007, prod-exclusion → 009), and every downstream component task *consumes* those gates as free CI acceptance rather than re-testing them. The single largest cross-task hazard is **fixture ownership** — the real-`Post` fixture must be created early (005) and reused by 006/007, or the FR-8 compile-error guardrail is undermined by ad-hoc Post shapes upstream.

---

## Task Test Responsibilities

```yaml
- task_id: "001"
  task_name: coexistence-tooling-storybook-boot
  test_theme: "Two style runtimes coexist with zero regression, and Storybook 9 boots on Next 16 — the toolchain gate."
  owns:
    - "FR-1 coexistence no-regression e2e (existing routes render unchanged; chromium signal) — the primary runtime integration seam"
    - "preflight-disabled-baseline-intact: MUI CssBaseline authoritative, Emotion wins cascade ties via injectFirst"
    - "storybook-boots: Storybook 9 boots on Next 16 with no adapter console errors (ADR-DS-1 spike verification)"
    - "next/image + next/font render without missing-mock warnings (proves the @storybook/nextjs adapter, gates 007 fidelity)"
    - "Primary ownership of sec-deps-pinned-and-locked: lockfile committed, its dep influx (Tailwind, Storybook, next-themes) pinned not caret"
  must_not_test:
    - "Storybook prod-exclusion (009 owns FR-10) — 001 stands Storybook up but does not assert it stays out of the prod bundle"
    - "Token values / dark block (002 and 008 own tokens) — 001 registers light+dark names with next-themes but the values land later"
    - "Purity lint rule pass/fail (003 owns FR-3)"
  integration_seams:
    - "e2e/coexistence.spec.ts — existing MUI app renders unchanged after Tailwind+next-themes land (the FR-1 no-regression seam)"
  shared_fixtures:
    - ".storybook/main.ts + preview.tsx scaffold and ThemeProvider — the Storybook harness every downstream story task (004–008) builds on"
    - "The verified adapter choice (@storybook/nextjs vs react-vite fallback) — a decision all Pages/story fidelity depends on"

- task_id: "002"
  task_name: two-layer-token-codegen
  test_theme: "The token seam is a single deterministic source of truth: TS two-layer input → byte-identical @generated CSS, path-safe."
  owns:
    - "tokens-codegen-deterministic: generate:tokens run twice emits byte-identical tokens.css (no timestamps/random ordering)"
    - "generated-css-carries @generated banner; regenerate overwrites a hand-edit (generated-css-not-hand-edited)"
    - "tokens-two-layer-shape: distinct primitive + semantic maps; every semantic alias resolves to a primitive, never inline hex (a type-level check in tokens.test.ts)"
    - "sec-codegen-path-safety: output path is a hardcoded literal, fails fast if resolved outside src/theme/"
    - "Token portion of sec-no-secrets-in-tokens-or-fixtures: tokens.ts references no .env/credential"
  must_not_test:
    - "The dark .dark {} block (008 owns FR-9) — 002 builds the codegen that can emit it, but the dark values and the single-block assertion belong to 008"
    - "Whether components consume semantic-only (003 owns the lint rule; 004–006 carry it as acceptance)"
  integration_seams:
    - "None runtime — but note the codegen/dark seam: the generator must be dark-aware so 008 adds dark by editing tokens.ts and re-running codegen, never hand-editing tokens.css"
  shared_fixtures:
    - "src/theme/tokens.css (@generated semantic layer) + globals.css @import wiring — consumed by every component (004–006), theming (008), and Storybook preview"

- task_id: "003"
  task_name: token-purity-lint-gate
  test_theme: "Semantic-only consumption is a mechanical lint failure — the one place the FR-3 purity rule's pass/fail is proven."
  owns:
    - "raw-hex-in-component-fails-lint: raw hex literal OR --brand-*/palette.* import in a component fails npm run lint and names the file"
    - "component-uses-semantic-only: a semantic-alias-only component passes the rule (the positive case)"
    - "Biome pinned not caret + lockfile committed (ADR-DS-6 — an upgrade must not silently disable enforcement)"
  must_not_test:
    - "Any specific component's compliance (004/005/006 each carry 'passes purity lint' as CI acceptance, but the rule's own pass/fail lives only here)"
    - "CSS-file raw-hex (out of scope per ADR-DS-6 — JS/TSX-language rule only; see Risk Flags)"
  integration_seams: []
  shared_fixtures:
    - "The no-direct-palette-import rule itself — shared test infrastructure; 004–007 get purity checking for free at lint time"
    - "A throwaway raw-hex fixture component proving the rule fires (kept as a guarded test asset or removed after)"

- task_id: "004"
  task_name: shadcn-primitives-badge-cva-atoms
  test_theme: "The atom layer is restyled to the Figma look through semantic tokens, with Badge categories as a compile-safe closed taxonomy."
  owns:
    - "shadcn-primitives-installed: badge/button/input/navigation-menu(+sheet)/card/avatar land in the tree importing semantic tokens"
    - "primitives-restyled-to-figma: Figma light look, no stock shadcn default color hardcoded (partly hitl — see Risk Flags)"
    - "badge-category-exhaustive: CVA map defines all 8 category hues"
    - "badge-missing-category-compile-error: a category with no variant entry is a tsc --noEmit compile error (type-level check, not runtime)"
    - "atoms-have-exhaustive-matrices: named story per variant/state + a Playground per atom"
    - "sidebar-atomic-design-order: SOLE owner of the ordering scenario — establishes the Atoms/Molecules/Organisms/Pages title-path convention"
    - "Radix/CVA/shadcn-generated-source deps pinned + reviewed as first-party (its slice of sec-deps-pinned-and-locked)"
  must_not_test:
    - "The purity lint rule pass/fail (003 owns) — 004 only carries 'passes purity lint' as acceptance"
    - "sidebar ordering must NOT be re-asserted by 005/006 — they carry 'titles under their path' as acceptance; the ordering scenario is proven once, here"
    - "Coexistence/no-regression (001 owns) — atoms render in Storybook isolation, no live route touched"
  integration_seams:
    - "Badge CVA closed-union compile-error is the type-level analogue of skillPresentation's exhaustive Record — verified via a tsc negative check"
  shared_fixtures:
    - "The restyled primitives in src/components/ui/* — consumed by every molecule (005) and organism (006) composition"

- task_id: "005"
  task_name: bespoke-molecules
  test_theme: "Small Figma compositions compose atoms (never re-implement) and bind only to semantic tokens."
  owns:
    - "bespoke-compositions-exist (MOLECULE subset): post card, newsletter, author-info, page-info, conclusion, ads-space exist as components"
    - "compositions-compose-primitives (MOLECULE subset): each composes Task-004 primitives rather than re-implementing them"
    - "Each molecule has a representative-content story under Molecules/ (not an exhaustive matrix — that's atoms-only per FR-7)"
  must_not_test:
    - "The purity lint rule itself (003 owns) — carries 'passes no-direct-palette-import' as acceptance only"
    - "sidebar-atomic-design-order (004 owns) — 005 just titles its own stories under Molecules/"
    - "The Post-type compile-error guardrail (007 owns invented-post-prop-rejected) — but see shared_fixtures: 005 should still type PostCard data against the real Post"
    - "Organism/footer/article/post-layout existence (006 owns that subset of bespoke-compositions-exist)"
  integration_seams: []
  shared_fixtures:
    - "OWNS the shared real-Post fixture (src/stories/fixtures/posts.ts), typed against the real Post from src/data/posts.ts, because PostCard.stories is the EARLIEST consumer of Post-shaped data. 006 and 007 then reuse it. This propagates the FR-8 guardrail upstream and prevents three tasks inventing ad-hoc Post shapes."

- task_id: "006"
  task_name: bespoke-organisms-post-layout
  test_theme: "Top-of-chain organisms compose molecules, and the article/prose layer consumes only the hardened MDX seam — the pack's one negative security obligation."
  owns:
    - "bespoke-compositions-exist (ORGANISM subset): footer, article/prose, post-layout exist; post-layout composes molecules/organisms not re-implemented"
    - "compositions-compose-primitives (ORGANISM subset)"
    - "mdx-trust-seam-unchanged + owner-authored-rule-not-relaxed: postLoader.ts and mdxPresentation.tsx are byte-unchanged (git-diff assertion)"
    - "sec-mdx-seam-untouched + sec-no-second-mdx-render-path: article/prose consumes only hardened output, adds no second render path, drops no rel/neutralizers"
    - "Each organism has a representative-content story under Organisms/"
  must_not_test:
    - "The purity lint rule (003 owns) and sidebar ordering (004 owns) — acceptance-only"
    - "Molecule existence (005 owns) and Post-type compile guardrail (007 owns)"
  integration_seams:
    - "git-diff byte-unchanged assertion on src/data/postLoader.ts + src/utils/mdxPresentation.tsx — the FR-11 MDX seam integration check (this task has the article/prose context to own it)"
  shared_fixtures:
    - "Reuses the real-Post fixture from 005 for ArticleProse/PostLayout stories — must NOT create its own Post shape"

- task_id: "007"
  task_name: pages-stories-real-post-type
  test_theme: "Four screen-level stories compose real organisms against the actual Post type, so any divergence is a compile error — the pack's cheap insurance against pack-2 rework."
  owns:
    - "pages-stories-render: Home, Single Post, Author each compose real organisms into a full screen under Pages/ (Home and Blog Listing merged under the blog-first IA — see spec.md FR-8)"
    - "pages-use-real-post-type: fixtures typed as the actual Post from postLoader.ts (slug, title, dek, date, readingTimeMinutes, formattedDate, published)"
    - "invented-post-prop-rejected: omitting/renaming a real Post field is a tsc --noEmit compile error (type-level check — the FR-8 guardrail)"
    - "Fixture portion of sec-no-secrets-in-tokens-or-fixtures: fixtures reuse only the public Post type, reference no .env/credential"
  must_not_test:
    - "Organism internals (006 owns) — 007 composes them, does not re-verify their composition"
    - "next/image/next/font mock correctness (001 owns the adapter verification) — 007 relies on it for faithful render"
  integration_seams:
    - "The Post-type compile-error guardrail is the FR-8 seam between this styling pack and pack-2 route migration — proven via a tsc negative fixture"
  shared_fixtures:
    - "Reuses (does not recreate) the real-Post fixture from 005; imports src/stories/fixtures/posts.ts forward"

- task_id: "008"
  task_name: light-dark-theming
  test_theme: "Dark ships as a single semantic-layer token block pixel-matched from the real Figma dark frame (node 614:679), proving components need zero per-theme change."
  owns:
    - "theme-toggles-light-dark: the .dark class swaps semantic token values and components re-render"
    - "dark-is-single-token-block: the entire dark palette is one .dark {} block sourced from the Figma dark frame (node 614:679 — bg #090d1f, heading white, body #c0c5d0)"
    - "no_component_requires_per_theme_code_change: negative assertion — best proven by git-diff scoped to estimated_files (only tokens.ts/tokens.css/preview/ThemeProvider changed, zero component files)"
  must_not_test:
    - "Codegen determinism (002 owns) — 008 edits tokens.ts and RE-RUNS generate:tokens to emit the .dark block; it must NOT hand-edit tokens.css and must NOT re-assert byte-identical determinism"
    - "Individual component styling (004–006 own) — the whole point is no component changes"
  integration_seams:
    - "The 'zero per-component diff' proof is a cross-task integration claim: it validates that 004–006's semantic-only binding actually held"
  shared_fixtures:
    - "Storybook theme toggle in preview.tsx — reused for visual review of both themes across all existing stories"

- task_id: "009"
  task_name: storybook-prod-exclusion-ci
  test_theme: "The production build ships no Storybook runtime, story modules, or storybook-static/, enforced by the pre-push gate (GitHub Actions is deploy-only)."
  owns:
    - "prod-build-excludes-storybook: SSG output contains no Storybook runtime, no storybook-static/ under the deployed tree"
    - "stories-not-in-ssg-output: no *.stories.* module or fixture in a shipped route chunk"
    - "sec-storybook-excluded-from-prod: the pre-push gate FAILS the push if any Storybook artifact is found in the build tree (asserted by a src/security/ vitest test; no CI/Actions check)"
  must_not_test:
    - "That Storybook boots/renders (001 owns) — 009 asserts the inverse: that it is ABSENT from prod"
  integration_seams:
    - "scripts/check-no-storybook-in-build.sh wired into .husky/pre-push + asserted by src/security/storybook-prod-exclusion.test.ts — the build-output integration gate; runs against the real npm run build artifact"
  shared_fixtures: []
```

---

## Spec Coverage Map

```yaml
# FR-1
- spec_scenario: "tooling-coexists-no-regression"
  owning_task: "001"
  test_type: e2e
- spec_scenario: "preflight-disabled-baseline-intact"
  owning_task: "001"
  test_type: e2e

# FR-2
- spec_scenario: "tokens-codegen-deterministic"
  owning_task: "002"
  test_type: unit
- spec_scenario: "tokens-two-layer-shape"
  owning_task: "002"
  test_type: unit   # type-level shape assertion
- spec_scenario: "generated-css-not-hand-edited"
  owning_task: "002"
  test_type: unit

# FR-3
- spec_scenario: "component-uses-semantic-only"
  owning_task: "003"
  test_type: unit   # lint-gate positive case
- spec_scenario: "raw-hex-in-component-fails-lint"
  owning_task: "003"
  test_type: unit   # lint-gate negative case

# FR-4
- spec_scenario: "shadcn-primitives-installed"
  owning_task: "004"
  test_type: unit   # Storybook render + import assertion
- spec_scenario: "primitives-restyled-to-figma"
  owning_task: "004"
  test_type: e2e    # Storybook visual — partly hitl (see Risk Flags)

# FR-5 — SPLIT SCENARIOS (flagged below)
- spec_scenario: "bespoke-compositions-exist (molecule subset: post card, newsletter, author-info, page-info, conclusion, ads-space)"
  owning_task: "005"
  test_type: unit
- spec_scenario: "bespoke-compositions-exist (organism subset: footer, article/prose, post-layout)"
  owning_task: "006"
  test_type: unit
- spec_scenario: "compositions-compose-primitives (molecule subset)"
  owning_task: "005"
  test_type: unit
- spec_scenario: "compositions-compose-primitives (organism subset)"
  owning_task: "006"
  test_type: unit

# FR-6
- spec_scenario: "badge-category-exhaustive"
  owning_task: "004"
  test_type: unit
- spec_scenario: "badge-missing-category-compile-error"
  owning_task: "004"
  test_type: unit   # tsc --noEmit compile-error

# FR-7
- spec_scenario: "storybook-boots"
  owning_task: "001"
  test_type: integration
- spec_scenario: "atoms-have-exhaustive-matrices"
  owning_task: "004"
  test_type: unit
- spec_scenario: "sidebar-atomic-design-order"
  owning_task: "004"   # SOLE owner — 005/006 carry title-path as acceptance only
  test_type: unit

# FR-8
- spec_scenario: "pages-stories-render"
  owning_task: "007"
  test_type: integration   # full-screen Storybook compose
- spec_scenario: "pages-use-real-post-type"
  owning_task: "007"
  test_type: unit
- spec_scenario: "invented-post-prop-rejected"
  owning_task: "007"
  test_type: unit   # tsc --noEmit compile-error

# FR-9
- spec_scenario: "theme-toggles-light-dark"
  owning_task: "008"
  test_type: integration
- spec_scenario: "dark-is-single-token-block"
  owning_task: "008"
  test_type: unit

# FR-10
- spec_scenario: "prod-build-excludes-storybook"
  owning_task: "009"
  test_type: integration   # build-output scan
- spec_scenario: "stories-not-in-ssg-output"
  owning_task: "009"
  test_type: integration

# FR-11
- spec_scenario: "mdx-trust-seam-unchanged"
  owning_task: "006"
  test_type: integration   # git-diff byte-unchanged
- spec_scenario: "owner-authored-rule-not-relaxed"
  owning_task: "006"
  test_type: integration

# FR-12
- spec_scenario: "mobile-breakpoint-matches-figma-frame"
  owning_task: "007"
  test_type: visual   # hitl Storybook review at mobile viewport

# Security Scenarios
- spec_scenario: "sec-storybook-excluded-from-prod"
  owning_task: "009"
  test_type: integration
- spec_scenario: "sec-mdx-seam-untouched"
  owning_task: "006"
  test_type: integration
- spec_scenario: "sec-no-second-mdx-render-path"
  owning_task: "006"
  test_type: integration
- spec_scenario: "sec-deps-pinned-and-locked"
  owning_task: "001"   # PRIMARY owner — 003 (Biome) + 004 (Radix/CVA/shadcn) verify their own additions as acceptance
  test_type: unit
- spec_scenario: "sec-codegen-path-safety"
  owning_task: "002"
  test_type: unit
- spec_scenario: "sec-no-secrets-in-tokens-or-fixtures (tokens portion)"
  owning_task: "002"
  test_type: unit
- spec_scenario: "sec-no-secrets-in-tokens-or-fixtures (fixtures portion)"
  owning_task: "007"
  test_type: unit
```

### Coverage flags (ambiguous / multi-owner scenarios)

```yaml
- scenario: "bespoke-compositions-exist / compositions-compose-primitives"
  issue: "Both FR-5 scenarios are listed in the implements of BOTH 005 and 006."
  resolution: "Deliberate partition, not a gap — molecules (post card, newsletter, author-info, page-info, conclusion, ads-space) owned by 005; organisms (footer, article/prose, post-layout) owned by 006. Each task tests only its own component subset. No component is double-owned. Acceptable as-is."

- scenario: "sidebar-atomic-design-order"
  issue: "Listed in implements of 004 AND 005 — two claimants (006 does not list it)."
  resolution: "Assigned SOLELY to 004 (establishes the Atoms/Molecules/Organisms/Pages title-path convention). 005/006 carry 'my stories title under my path' as acceptance but must NOT re-run the ordering scenario test. Prevents duplicated sidebar assertions."

- scenario: "sec-deps-pinned-and-locked"
  issue: "Listed in implements of 001, 003, AND 004 — a distributed supply-chain invariant."
  resolution: "PRIMARY ownership → 001 (largest dep influx + lockfile discipline). 003 (Biome pin) and 004 (Radix/CVA/shadcn-generated source) each verify their own additions are pinned as a per-task acceptance line, NOT a duplicated full-tree scenario test. This is legitimately distributed because each task introduces distinct deps at distinct times."

- scenario: "sec-no-secrets-in-tokens-or-fixtures"
  issue: "Two distinct authored surfaces — tokens (002) and fixtures (007)."
  resolution: "Split by surface: token-secrets → 002, fixture-secrets → 007. Both legitimate; no overlap."

- scenario: "component-uses-semantic-only"
  issue: "The FR-3 positive scenario is implemented by 003 AND referenced by 004/005 acceptance."
  resolution: "The rule's pass/fail test → 003 only. 004/005/006 carry 'passes purity lint' as CI acceptance (their code is an input to the rule), not a re-implementation of the scenario."
```

No scenario is left without an owner. Every Scenario and Security Scenario in spec.md maps to exactly one owning task (with the FR-5 split being a clean by-component partition, not a duplication).

---

## Integration Test Plan

```yaml
- seam: "MUI ↔ Tailwind coexistence no-regression (existing app renders byte-for-byte unchanged after tooling lands)"
  owning_task: "001"
  rationale: "001 is the task that introduces the coexistence tooling (preflight-disabled, injectFirst) — it must prove the live app did not regress via e2e/coexistence.spec.ts. Gated on chromium (the reliable signal per CLAUDE.md); webkit/mobile have known pre-existing failures and cannot carry the no-regression claim."

- seam: "MDX trust seam byte-unchanged (postLoader.ts buildPostSet slug gate + mdxPresentation.tsx hardening untouched; no second render path)"
  owning_task: "006"
  rationale: "006 builds the article/prose organism — the ONLY component in the pack that touches Post body content and the only one that could introduce a second MDX render path. It has full context of both sides of the seam, so it owns the git-diff byte-unchanged assertion and the 'consumes hardened output only' check. Assigning to the later task with the rendering context, not to 001/007 which never see raw MDX."

- seam: "Storybook excluded from production SSG output (no runtime, no *.stories.*, no storybook-static/ in the build tree) + pre-push gate"
  owning_task: "009"
  rationale: "009 runs last against the real npm run build artifact after all stories (004–007) exist — only then can the exclusion scan see the full story surface it must prove absent. Owning it earlier (e.g. 001) would test an incomplete story set. The pre-push gate (scripts/check-no-storybook-in-build.sh wired into .husky/pre-push, asserted by src/security/storybook-prod-exclusion.test.ts) is the durable gate — GitHub Actions is deploy-only and runs no checks. This is why 009 blocked_by now includes 007."

- seam: "Dark theme adds zero per-component diff (validates 004–006's semantic-only binding actually held)"
  owning_task: "008"
  rationale: "008 is the first task to exercise the semantic indirection under a second theme. A git-diff scoped to its estimated_files (tokens.ts/tokens.css/preview/ThemeProvider only, no component files) is the integration proof that FR-3's purity paid off. Belongs to 008 because it is the task that would have been forced to touch components if the binding had leaked."

- seam: "Post-type compile-error guardrail (pack-1 → pack-2 migration insurance)"
  owning_task: "007"
  rationale: "The tsc --noEmit negative fixture that rejects an invented Post prop is the contract seam between this styling pack and pack-2 route migration. 007 composes the real organisms against the real Post type and is the natural owner. Note the upstream dependency: this guardrail only holds if 005/006 also typed their Post-shaped story data against the real Post (shared fixture now owned by 005)."
```

---

## Risk Flags

```yaml
- description: "Storybook ↔ Next 16 adapter spike (ADR-DS-1) is unresolved until 001 runs. A react-vite fallback loses next/image + next/font mocks, so 007's Pages stories render through an unfaithful image/font path — the FR-8 'faithful de-risking' render becomes visual-drift and cannot be asserted mechanically."
  severity: high
  mitigation: "001 sequences the spike FIRST and owns the boot + mock-warning tests. If the fallback triggers, explicitly downgrade 007's 'faithful render' acceptance to 'composes + type-checks' and flag Pages visual fidelity as a known gap carried into pack-2, rather than silently claiming fidelity the harness can't back."

- description: "primitives-restyled-to-figma (004) 'matches the Figma light look' cannot be asserted mechanically — pixel/visual fidelity relies on hitl Storybook review. Only the 'no stock shadcn default color / no raw hex' half is machine-checkable (via 003's purity lint)."
  severity: medium
  mitigation: "Split the scenario at implement time: 003's lint gate owns 'no raw hex / no primitive import' (mechanical); the Figma-match is a hitl visual sign-off in Storybook (task 004 is interaction: hitl). Do not write a brittle screenshot-diff test hoping to mechanize a subjective Figma match; record the visual approval as the gate."

- description: "Fixture ownership ordering: the real-Post fixture is now created in 005 (earliest consumer). 006 and 007 must import it forward, never recreate. If 005/006 invent ad-hoc Post shapes, the FR-8 compile-error guardrail is undermined before 007 even runs, and three tasks duplicate Post fixtures."
  severity: high
  mitigation: "RECONCILED: creation of src/stories/fixtures/posts.ts moved to 005, typed against the real Post from src/data/posts.ts. 006 and 007 import forward, never recreate. Propagates the guardrail upstream and eliminates duplicate fixtures."

- description: "tokens-codegen-deterministic (002) byte-identical requirement is flakiness-prone: Map/object iteration order, JSON key ordering, or an accidental timestamp/hostname in the @generated banner breaks it non-deterministically across machines/CI."
  severity: medium
  mitigation: "002's test runs generate:tokens twice and diffs bytes in the same test. Enforce deterministic serialization (sorted keys, no Date/env/random in the emitter). The banner must be a static literal. This makes non-determinism fail loudly in 002's own suite, not later in an unrelated CI run."

- description: "Coexistence no-regression e2e (001) is gated on chromium only; webkit/mobile have known pre-existing failures. A real coexistence/cascade regression that manifests only on webkit would be masked, yet FR-1's claim is 'every existing route renders unchanged'."
  severity: medium
  mitigation: "Accept chromium as the signal per CLAUDE.md, but scope the FR-1 claim honestly: 'no new chromium failures' — do not overstate byte-for-byte across engines the suite cannot currently vouch for. If webkit cascade behavior matters for pack-2 mixed routes, note it as deferred verification, not covered here."

- description: "Codegen/dark seam (002 ↔ 008): 008 adds the .dark {} block by editing tokens.ts and re-running generate:tokens. If 002's emitter is not dark-aware (only emits :root light vars), 008 is forced to either extend the codegen (scope creep) or hand-edit tokens.css (violating generated-css-not-hand-edited)."
  severity: medium
  mitigation: "RECONCILED: 002's emitter must support a theme-block structure (light → :root, dark → .dark) from the start, even if the dark values are empty until 008 fills them. Confirmed as a 002 acceptance line so 008 is a pure token-value edit, not a generator change."

- description: "Token-purity lint gap (ADR-DS-6): no-direct-palette-import is JS/TSX-only. A raw hex in a hand-authored .css file passes lint clean, silently reintroducing the drift FR-3 exists to prevent."
  severity: low
  mitigation: "003 owns the JS/TSX rule; the residual .css gap is accepted per ADR-DS-6 because this pack's model is utility-class + generated tokens.css only (no hand-authored component .css should exist). 004–006 must NOT introduce authored .css files; if that assumption breaks in a later pack, revisit CSS-surface enforcement."

- description: "AA-contrast accepted risk (ADR-DS-4) on #7F56D9 in dark mode will be flagged by any automated a11y scanner without the scoped-usage + dark-mode --primary-strong context."
  severity: low
  mitigation: "Do not add an automated AA-contrast assertion that would fail the build against a documented accepted-risk. ADR-DS-4 is the record; 002 places a rationale comment near --primary in tokens.ts so the trade-off travels with the token. If an a11y audit runs, treat the dark-mode #7F56D9 flag as expected, not a regression."
```
