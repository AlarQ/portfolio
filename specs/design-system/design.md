# Design - `design-system`

> Architecture, decisions, and trade-offs for the first pack of the MUI 7 →
> shadcn/ui re-platform. This document owns the **WHY** - rationale, ADRs,
> module boundaries. The **WHAT** (functional requirements, scenarios, security
> scenarios) lives in [`spec.md`](./spec.md) and is referenced here by id
> (FR-N / scenario name); it is never restated. Repo-level, cross-spec decisions
> live in `docs/adr/`; the ADRs below (`ADR-DS-*`) are **spec-scoped** to this
> pack.

## Architecture Overview

```mermaid
graph TB
  subgraph TokenSeam["Token Seam (FR-2)"]
    TokensTS["tokens.ts (primitive layer)"] --> TokensTSSem["tokens.ts (semantic aliases)"]
    TokensTSSem -.-> Codegen["generate:tokens (codegen)"]
    Codegen -.-> TokensCSS["@generated tokens.css"]
  end

  subgraph Presentation["Presentation Layer (FR-3, FR-6)"]
    SemanticOnly["Semantic-only consumption (--primary, --foreground)"]
    BadgeCVA["Badge CVA variant map (exhaustive)"]
  end

  subgraph Primitives["shadcn Primitives (FR-4)"]
    Badge[badge] --> SemanticOnly
    Button[button] --> SemanticOnly
    Input[input] --> SemanticOnly
    NavMenu["navigation-menu + sheet"] --> SemanticOnly
    Card[card] --> SemanticOnly
    Avatar[avatar] --> SemanticOnly
    Badge --> BadgeCVA
  end

  subgraph Bespoke["Bespoke Compositions (FR-5)"]
    PostCard[post card] --> Primitives
    Newsletter[newsletter] --> Primitives
    Footer[footer] --> Primitives
    PageInfo[page-info] --> Primitives
    Article["article / prose layer"] --> Primitives
    AuthorInfo[author-info] --> Primitives
    Conclusion[conclusion] --> Primitives
    AdsSpace[ads-space] --> Primitives
    PostLayout[post-layout] --> Bespoke
  end

  subgraph Storybook["Storybook 9 Workshop (FR-7, FR-8, FR-10)"]
    Atoms["Atoms/ (exhaustive matrices)"] --> Primitives
    Molecules["Molecules/"] --> Bespoke
    Organisms["Organisms/"] --> Bespoke
    Pages["Pages/ (Home, Single Post, Author - Home+Blog Listing merged, FR-8)"] --> Organisms
    Pages --> PostType
  end

  subgraph MUIApp["Live MUI App (untouched routes)"]
    Coexist["StyledEngineProvider injectFirst + Tailwind preflight disabled (FR-1)"]
    Routes["/, /projects, /blog, /blog/[slug]"] --> Coexist
  end

  subgraph MDXSeam["MDX Trust Seam (unchanged - ADR-0001, D-7, FR-11)"]
    PostLoader["postLoader.ts buildPostSet (imports Post)"]
    MdxPresentation["mdxPresentation.tsx hardening"]
  end

  PostType["Post type (src/data/posts.ts)"] -.-> PostLoader

  TokensCSS --> Primitives
  TokensCSS -.-> Coexist
  Article -.->|"reads hardened output only, never re-parses"| MdxPresentation
  PostLoader -.-> PostType

  Storybook -->|"dev-only, excluded from SSG"| MUIApp
```

Dependency direction is strictly downward: `tokens.ts` (primitive → semantic) is
the sole source; `generate:tokens` is a build-step edge (dashed) into the
generated CSS, never hand-authored in reverse. Presentation resolution happens
once, at the semantic boundary - primitives and bespoke compositions both depend
on that boundary, never on primitives or raw hex directly (FR-3). Bespoke
compositions depend on primitives, never the reverse, keeping the atomic-design
layering (`Atoms → Molecules → Organisms → Pages`) a one-way composition chain
mirrored 1:1 by Storybook's sidebar. The `MUIApp` subgraph and the
`TokenSeam`/`Primitives`/`Bespoke`/`Storybook` subgraphs are **disjoint at
runtime** this pack - the only edge between them is the shared coexistence
tooling (`Coexist`) and, in a later pack, route migration. The `MDXSeam`
subgraph has no inbound edges from this pack's new code except a read-only,
one-directional consumption arrow from `Article` - it is depended upon, never
modified (FR-11, D-7, ADR-0001).

## Architecture Decision Records

### ADR-DS-1: Storybook ↔ Next 16 adapter - `@storybook/nextjs` primary, `@storybook/react-vite` fallback

**Status:** Accepted

**Context:** FR-7 requires Storybook 9 to boot against Next 16 with no adapter
errors (`storybook-boots`). This is a toolchain-gating spike (prd.md Open
Questions #1) - if the official Next adapter doesn't support Next 16 yet, the
whole pack's tool choice changes.

**Decision:** Open the design phase by spiking `@storybook/nextjs` against the
installed Next 16 version. Verification: `npm run storybook` boots with no
adapter console errors, and a story importing `next/image` and a component using
`next/font` render without the raw-`<img>`/font-loader warnings that signal a
missing mock. If `@storybook/nextjs` does not yet support Next 16 (version-lag is
a known Storybook-adapter failure mode), fall back to `@storybook/react-vite`
and accept the consequence below.

**Consequences:** Choosing `@storybook/nextjs` keeps `next/image` and `next/font`
mocked, so Pages stories (FR-8) visually match production image/font behavior.
Falling back to `react-vite` loses both mocks - Pages stories would need
hand-rolled `next/image`/`next/font` shims or accept visual drift versus the real
app, which weakens the FR-8 "cheap insurance against pack-2 rework" guarantee
(components accept the real `Post` type but would render through an unfaithful
image/font path). This is the highest-severity gating risk in the pack (see Risk
Flags) because it is discovered, not decided, and can force re-scoping FR-7/FR-8
mid-build.

**Alternatives considered:** Skip Storybook and review components ad hoc in a
throwaway Next route - rejected, it defeats FR-7's atomic-design workshop
requirement and the "prove the system before touching live routes" value
proposition (spec.md Overview).

**Serves:** FR-7, FR-8. **KB rule:** `architecture/general.md` Scope Discipline
(verify before committing scope) - the spike is sequenced first specifically so a
toolchain failure is cheap, not discovered after primitives are restyled.

---

### ADR-DS-2: MUI/Tailwind coexistence ordering - `injectFirst` + disabled preflight, one-pass mixed-route migration

**Status:** Accepted

**Context:** FR-1 requires both runtimes to load without regressing the existing
MUI app (`tooling-coexists-no-regression`, `preflight-disabled-baseline-intact`).
Two CSS runtimes now share every page's cascade.

**Decision:** Tailwind's `preflight` is disabled so MUI `CssBaseline` remains the
base-element authority; `StyledEngineProvider injectFirst` pins Emotion's
`<style>` tags first in `<head>`, so Emotion wins cascade ties against Tailwind
utility classes during coexistence. When a later pack migrates a route off MUI,
that route is migrated **fully in one pass** - no route is left "mixed"
(partially MUI, partially shadcn) as a resting state.

**Consequences:** The live app renders byte-for-byte unchanged this pack (FR-1's
acceptance bar). The cost lands in pack 2+: any route that is mid-migration pays
both runtimes simultaneously (Emotion + Tailwind bundle weight, duplicate cascade
reasoning) - acceptable only as a transient state, not a resting one, because a
resting mixed route is where cascade-tie bugs actually surface in production per
prior migration experience. The one-pass rule is a scope-discipline device: it
prevents "discovering" `injectFirst` edge cases live on a partially migrated
production route.

**Alternatives considered:** Enable Tailwind preflight and re-theme MUI's
`CssBaseline` to match - rejected, doubles the reset surface to maintain during
coexistence and risks silent baseline drift the byte-for-byte scenario is
designed to catch. Migrate routes incrementally section-by-section - rejected per
the one-pass rule; a partially migrated route is the worst-cost resting state
(double runtime, unclear cascade owner). No `injectFirst` (default Tailwind-wins
ordering) - rejected, Tailwind's utility classes would non-deterministically
override Emotion component internals, breaking `preflight-disabled-baseline-intact`.

**Serves:** FR-1. **KB rule:** `architecture/general.md` Boundaries and Coupling
("clear interfaces… no hidden dependencies"); style-engine cascade authority is
made an explicit, testable interface rather than an implicit load-order accident.

---

### ADR-DS-3: Two-layer token codegen - `tokens.ts` (primitive → semantic) generates `@generated tokens.css`

**Status:** Accepted

**Context:** FR-2 and FR-3 require a single source of truth for tokens and a
mechanically-enforceable semantic-only consumption rule. D-6 (prd.md) already
decided TS-authoring over `shadcn init`'s default flat CSS-variable file, citing
the `repeat-app` precedent where `shadcn init` flattened the two-layer model into
one undifferentiated CSS block, silently erasing the primitive/semantic
distinction and making `no-direct-palette-import`-style purity unenforceable
(nothing to distinguish "primitive" from "semantic" once both are opaque CSS
custom properties).

**Decision:** `src/theme/tokens.ts` is authored as two distinct exported maps - a
primitive palette and a semantic alias map that resolves every semantic name to a
primitive, never to an inline hex (mirrors the existing `brand` seam pattern in
`src/theme/theme.ts`). A `generate:tokens` script mechanically emits `@generated
tokens.css` from `tokens.ts`; the generated file carries an `@generated` banner
and is never hand-edited (`generated-css-not-hand-edited`). CSS wiring uses
Tailwind v4's `@theme inline` to bridge the generated semantic custom properties
into Tailwind's token space, with `@import` ordering such that `tokens.css` loads
before any Tailwind utility layer that references those variables. Regeneration
from unchanged `tokens.ts` input is required to be byte-identical
(`tokens-codegen-deterministic`) - the script must not embed timestamps, random
ordering, or environment-derived output.

**Consequences:** TypeScript authorship preserves compile-time exhaustiveness (a
semantic alias with no primitive backing is a type error, not a silent CSS gap)
and keeps the two-layer distinction durable against any future `shadcn` re-init.
The cost is an extra build step and a script that must be kept in the dependency
graph of every design change - a token edit that skips `generate:tokens` produces
a stale `tokens.css` with no compile-time signal (mitigated by wiring codegen
into the build/precommit path, not asserted by this ADR alone - flagged in Risk
Flags). Because `tokens.css` is a generated artifact, hand-editing it is a **MUST
NOT** per `architecture/general.md` "Generated Artifacts" - a project-specific
instance of that KB rule, not a new invention.

**Alternatives considered:** Accept `shadcn init`'s default flat CSS-only tokens
(no TS layer) - rejected per D-6/`repeat-app` precedent above: loses the
primitive/semantic distinction and the lint-enforceability it enables (ADR-DS-6).
Author both layers directly in CSS with `@layer` for separation - rejected, CSS
has no type system to make a missing semantic-to-primitive mapping a compile
error; TS does.

**Serves:** FR-2, FR-3. **KB rule:** `architecture/general.md` Generated
Artifacts (never hand-edit generated output; change the input, re-run the
generator); `style/general.md` Abstraction (concrete-first: the two layers exist
because a real prior failure - `repeat-app`'s flattening - was observed, not
because of speculative future-proofing).

---

### ADR-DS-4: Accept the dark-mode AA-contrast gap on `#7F56D9` as a documented risk, with a dark-mode `--primary-strong` as the escape hatch

**Status:** Accepted (accepted-risk)

**Context:** D-4 pins the Figma primary `#7F56D9` exactly. Measured against white
it is ≈4.96:1, which **passes** WCAG AA for normal text (AA requires 4.5:1) - no
light-mode trade-off exists for this hue, unlike the old `#4B6BFB` primary.
Measured against the Figma dark-frame background `#090d1f` it is ≈3.89:1, which
**fails** AA for normal text but passes AA for large text/UI components (3:1).
Pixel-fidelity to the Figma source (D-4) and AA conformance are in tension only
for dark-mode *text* usage of the primary hue.

**Decision:** Ship `#7F56D9` as specified in both themes. Accept the
dark-mode-only AA-small/normal-text failure as a known, bounded risk. Constrain
the blast radius: `#7F56D9` text on dark backgrounds is scoped to large text
(≥18px) or non-text roles (button fill, border, focus ring), never small dark-mode
body/inline text. A dark-mode-only `--primary-strong` semantic alias (`#A082E3`,
≈6.2:1 against `#090d1f`) is defined now in the semantic layer as the designated
escape hatch for dark-mode inline-link/text use, so a future contrast-driven fix
is a token-value change, not a per-component hunt.

**Consequences:** The site ships with one hue that a strict automated
AA-contrast checker will flag *in dark mode only*; light mode already passes AA
outright. The mitigation is scope-bounded dark-mode usage (never small dark-mode
text) plus the ready escape hatch, not a technical fix. If a future accessibility
audit demands AA everywhere in dark mode, swapping `--primary` to reference
`--primary-strong` for dark-mode inline-link/text contexts is a one-line semantic
re-point specifically because of the semantic-only consumption rule
(FR-3/ADR-DS-3): no component needs to change.

**Alternatives considered:** Darken/lighten `#7F56D9` globally to pass AA in both
themes - rejected, breaks D-4's pixel-fidelity requirement and defeats the goal
of proving the exact Figma visual language. Use `#7F56D9` only as a non-text
color in dark mode - rejected as unnecessarily conservative given large
semibold text already reads as acceptably legible per Figma; reserved for the
true small-text case via `--primary-strong` instead.

**Serves:** FR-4 (`primitives-restyled-to-figma`), FR-9 (semantic-token
indirection is what makes the escape hatch cheap). **KB rule:** none of the
architecture-general rules bear directly on visual a11y trade-offs; this ADR
exists to make the trade-off auditable rather than silently absorbed, consistent
with the "document decisions, not just designs" principle.

---

### ADR-DS-5: Dark palette sourced from the real Figma dark frame (node `614:679`), mapped onto the same semantic aliases

**Status:** Accepted

**Context:** D-5 requires both `light` and `dark` themes to ship in this pack.
Unlike the old "MetaBlog" source, "The Blog" Figma file **does** have a real
dark-mode frame (node `614:679`) with its own observed values: background
`#090d1f`, headings white, body text `#c0c5d0`, byline accent `#6941c6`. Dark is
therefore not a derivation problem - it is a second pixel-match target, same as
light.

**Decision:** Dark theme is **pixel-matched from the Figma dark frame**, not
derived from `theme.ts` and not algorithmically inverted from the light palette.
The observed dark-frame values (bg `#090d1f`, heading white, body `#c0c5d0`,
byline accent `#6941c6`, primary `#7F56D9` per ADR-DS-4) are mapped onto the same
semantic alias names the light (Figma) theme populates (`--primary`,
`--foreground`, `--background`, etc.), expressed as a single `.dark {}` token
block (FR-9, `dark-is-single-token-block`). No new dark-specific component logic
is introduced; `next-themes`' `class` strategy toggles which token block is
active. The existing portfolio `theme.ts` brand (`sky`/`lime`/`orange`) is not
consulted for this pack's dark tokens - it remains the MUI-side dark palette
until later packs retire MUI entirely.

**Consequences:** Light and dark are both first-class Figma pixel-matches,
consistent with D-4's fidelity requirement - there is no "the dark theme isn't
really from Figma" caveat to carry forward. The trade-off: the portfolio's
established "cyber" dark brand identity is **not** carried into the new design
system; a future observer comparing the old MUI dark look to the new shadcn dark
look will see two different dark aesthetics. That is an intentional, recorded
decision (this ADR), not an oversight - it falls out of D-2's "adopt the Figma
template look" applying to both themes, not just light.

**Alternatives considered:** Derive dark from `theme.ts`'s existing
`sky`/`lime`/`orange` brand (the original approach) - rejected now that a real
Figma dark source exists; using it would mean shipping an *un*-pixel-matched
dark theme purely to preserve old brand continuity, contradicting D-4. Invert/
derive dark algorithmically from the Figma light palette (e.g. HSL lightness
flip) - rejected, produces an unvetted dark palette with no design review when
an actual designed dark frame is sitting right there in the source file.

**Serves:** FR-9. **KB rule:** `architecture/general.md` Scope Discipline (ship
what the current source of truth actually specifies, rather than substituting a
convenient existing artifact).

---

### ADR-DS-6: Token-purity lint (`no-direct-palette-import`) as a JS-language-only rule; Biome pinned

**Status:** Accepted

**Context:** FR-3 requires the semantic-only consumption rule to be mechanically
enforced, not just documented (`raw-hex-in-component-fails-lint`). The sibling
repos' precedent rule is `no-direct-palette-import`, implemented as GritQL. prd.md
Open Questions notes GritQL `language css` plugins are broken at Biome 2.4.15, and
Biome does not sort Tailwind classes (a separate, accepted gap - not this pack's
scope).

**Decision:** Adopt `no-direct-palette-import` as a **JS/TSX-language-only**
GritQL rule (matching import statements and property-value literals in component
source), not a `language css` rule. Pin the Biome version in `package.json` to
the last version verified compatible with the JS-language GritQL plugin at
implementation time, rather than floating on caret ranges, specifically because
the CSS-plugin breakage was version-specific and an unpinned Biome upgrade could
silently disable enforcement (a lint rule that stops running is worse than one
that was never written, because CI stays green while FR-3 quietly regresses).

**Consequences:** The purity rule catches raw hex literals and
`--brand-*`/`palette.*` imports inside `.tsx`/`.ts` component files at `npm run
lint` time - the mechanical gate FR-3 requires. It does **not** catch a raw hex
accidentally introduced directly in a `.css` file (out of scope given the broken
CSS-plugin path); that residual gap is a Medium risk (see Risk Flags), not a
Critical one, because FR-3's stated surface is component source, and `tokens.css`
itself is the one legitimate place raw-ish CSS variable definitions live (it's
generated output, not authored). Biome-pinning is an explicit supply-chain
control: routine `npm update` must not silently move Biome past the version the
GritQL plugin was verified against.

**Alternatives considered:** Wait for Biome to fix the CSS-plugin and enforce
both JS and CSS surfaces - rejected, blocks FR-3's compile/lint-gate requirement
on an upstream fix with no committed timeline. Write a custom regex-based
pre-commit hook instead of GritQL - rejected, less precise than an AST-aware
GritQL rule and adds a second lint mechanism to maintain alongside Biome.

**Serves:** FR-3. **KB rule:** `style/general.md` Suppressions ("a directive
referencing a non-existent rule group is dead documentation") - the inverse
failure mode here (a *rule* that silently stops running because of a toolchain
version) is the same category of risk, addressed by pinning rather than by hoping
the plugin stays fixed.

---

### ADR-DS-7: Hex primitives; primary ramp synthetically generated, all other hexes hand-pinned from observed Figma nodes

**Status:** Accepted

**Context:** prd.md Open Questions notes both sibling shadcn repos author tokens
in OKLCH, while this PRD (D-4) pins Figma-exact **hex**. The `budget-app`
precedent shipped hex + codegen successfully, though its OKLCH-avoidance was
originally driven by a React Native constraint that does not apply to this
Next.js/web-only pack. Unlike badge/gray/background hexes (each directly
observed on a Figma node), the primary color has only a single observed sample
(`#7F56D9`, "Primary/600" on the Subscribe button) - no published 50–900 shade
ramp exists in the file (confirmed via `get_libraries` + `search_design_system`),
yet hover/active states need shade headroom the single sample doesn't provide.

**Decision:** Author the primitive layer in hex (not OKLCH). Within that: the
primary 50–900 ramp is **synthetically generated** via HSL lightness
interpolation from the single observed `#7F56D9` sample, since no wider ramp
exists to hand-pin. Every other primitive hex (badge bg/text pairs, light/dark
grays, light/dark backgrounds, heading colors) is **hand-pinned** directly from
its observed Figma node - no generation, because a real sample exists for each.

**Consequences:** Hex keeps every hand-pinned primitive a direct, auditable 1:1
mirror of its Figma source value (no perceptual-space conversion to verify),
which matters for D-4's "pixel-match exactly" requirement. The generated primary
ramp is the one exception to pure pixel-fidelity - its 50/100/200/…/900 steps
other than the observed 600 are approximations, not observed Figma values, so a
future Figma update to the ramp (if one is ever published) should re-derive from
the new sample rather than hand-tuning the generated steps. The cost of staying
in hex generally is walking away from OKLCH's perceptual-uniformity benefits
(smoother interpolation) the sibling repos chose it for; no current caller in
this pack needs that (Scope Discipline).

**Alternatives considered:** Hand-pin only the single observed `#7F56D9` sample
with no ramp at all - rejected, leaves no distinct hover/active/focus shades,
forcing components to fake state changes with opacity instead of a real shade
step. Convert Figma hex to OKLCH at author time for consistency with sibling
repos - rejected, adds a lossy-perception conversion step with no current caller
purely for cross-repo consistency, a weaker justification than direct Figma
fidelity.

**Serves:** FR-2, FR-4 (D-4 fidelity). **KB rule:** `architecture/general.md`
Scope Discipline (ship code only with a current caller - OKLCH's perceptual-math
benefits have no caller in this pack; the generated ramp exists only because
hover/active states are a real, current need).

---

> **D-7 (MDX trust boundary unchanged) is intentionally not re-litigated here** -
> see [ADR-0001](../../docs/adr/0001-mdx-for-blog-posts.md) and spec.md FR-11 /
> `sec-mdx-seam-untouched` / `sec-no-second-mdx-render-path`. This pack's only
> obligation is negative: no component in the bespoke set (particularly
> `article`/prose) may introduce a second MDX rendering path or bypass
> `mdxPresentation.tsx`'s neutralizers.

## Trade-off Analysis

```yaml
- decision: Storybook Next.js adapter
  options:
    - name: "@storybook/nextjs"
      description: Official adapter with next/image and next/font mocks
      pros: [faithful Pages-story rendering, matches production image/font behavior, no shim code]
      cons: [may lag Next 16 support at implementation time - unverified until the spike runs]
    - name: "@storybook/react-vite"
      description: Generic Vite-based adapter, framework-agnostic
      pros: [stable, unaffected by Next-version lag]
      cons: [loses next/image and next/font mocks, Pages stories (FR-8) render with visual drift from production, needs hand-rolled shims]
  chosen: "@storybook/nextjs (with react-vite as verified fallback)"
  rationale: FR-8's whole value is Pages stories composed from the real Post type rendering faithfully enough to de-risk pack-2 migration; losing next/image/next/font mocks undermines exactly that. Spike first because it's the toolchain-gating risk.

- decision: MUI/Tailwind coexistence cascade authority
  options:
    - name: "injectFirst + preflight disabled"
      description: Emotion styles win cascade ties; Tailwind reset off
      pros: [byte-for-byte existing-app preservation, single reset authority (MUI CssBaseline)]
      cons: [Tailwind utilities can't override MUI internals without override escapes on components sharing a page with MUI - not expected this pack since routes stay disjoint]
    - name: "Tailwind preflight enabled, MUI CssBaseline retuned to match"
      description: Both resets active, manually reconciled
      pros: [single unified reset philosophy going forward]
      cons: [doubles reset-maintenance surface now, risks silent baseline drift, no test scenario currently proves reconciliation holds]
  chosen: injectFirst + preflight disabled
  rationale: FR-1's acceptance bar is literally byte-for-byte unchanged existing rendering; the reconciliation option has no verification story equal to that bar.

- decision: Token authoring format (TS two-layer vs shadcn-default flat CSS)
  options:
    - name: "tokens.ts (primitive + semantic) → generated tokens.css"
      description: TS source of truth, CSS is build output
      pros: [compile-time exhaustiveness, survives shadcn re-init flattening, enables lint-based purity enforcement]
      cons: [extra build step, staleness risk if generate:tokens is skipped]
    - name: "shadcn init default (flat CSS custom properties)"
      description: Accept shadcn's own generated CSS variables as source of truth
      pros: [zero extra tooling, exactly what shadcn CLI expects out of the box]
      cons: ["repeat-app precedent: shadcn init flattens the two-layer model, erasing the primitive/semantic split FR-3's purity rule depends on"]
  chosen: "tokens.ts two-layer + codegen"
  rationale: D-6, driven directly by an observed prior failure (repeat-app), not speculation.

- decision: AA contrast vs Figma pixel-fidelity for #7F56D9
  options:
    - name: "Ship #7F56D9 exactly, accept dark-mode AA-text failure"
      description: Pixel-match Figma in both themes; document and bound the dark-mode risk
      pros: [true design fidelity, matches D-4, passes AA outright on light/white, dark-mode escape hatch (--primary-strong) ready]
      cons: [fails a strict automated AA-contrast audit for dark-mode normal/small text]
    - name: "Darken/lighten to an AA-passing purple globally"
      description: Adjust the primary hue to clear 4.5:1 in both themes
      pros: [passes automated a11y audits everywhere]
      cons: [visibly diverges from the Figma source, defeats the "prove the exact design" pack goal]
  chosen: Ship exact hex, accept and bound the dark-mode risk
  rationale: D-4 owner decision; light mode already passes AA (4.96:1 on white); dark-mode blast radius is scoped to large text/non-text roles, with a token-level escape hatch for dark-mode inline text.

- decision: OKLCH vs hex for token authoring
  options:
    - name: hex
      description: Direct hex mirror of Figma source values
      pros: [pixel-fidelity auditable at a glance against Figma inspector, budget-app precedent proven]
      cons: [no perceptual-uniformity benefits for future generated shade ramps]
    - name: OKLCH
      description: Perceptual color space, matches both sibling repos
      pros: [better interpolation/shade generation, cross-repo consistency]
      cons: [lossy conversion step from the actual Figma hex source, no current caller/feature needs it]
  chosen: hex
  rationale: D-4 fidelity plus Scope Discipline - no color-ramp-generation feature exists yet to justify OKLCH's benefit.
```

## Risk Flags

```yaml
- severity: Critical
  description: "Storybook ↔ Next 16 adapter spike (ADR-DS-1) is unresolved until it runs; @storybook/nextjs may not yet support Next 16, forcing a mid-design fallback to @storybook/react-vite and losing next/image/next/font mocks."
  impact: "FR-7 (storybook-boots) and FR-8 (pages-stories-render, faithful Post-typed fixtures) could require re-scoping after implementation has started, undermining the pack's entire de-risking rationale (spec.md Overview: prove the system before touching live routes)."
  mitigation: "Sequence this spike first, before any component work. Define the fallback path and its cost (ADR-DS-1) now so a negative spike result is a known branch, not a surprise."

- severity: High
  description: "Mixed-route coexistence cost (ADR-DS-2): once pack 2+ starts migrating routes, any route left in a partially-migrated resting state pays both Emotion and Tailwind runtimes simultaneously, with cascade-tie behavior that's easy to get subtly wrong."
  impact: "Bundle bloat and hard-to-reproduce cascade bugs on production routes if the one-pass migration rule is skipped under time pressure in a later pack."
  mitigation: "This pack keeps routes fully disjoint (MUI untouched) so the risk is dormant now - record the one-pass rule in ADR-DS-2 as a binding constraint for pack 2, not just a suggestion."

- severity: Medium
  description: "Supply-chain: new dev-dependencies (Tailwind v4, @tailwindcss/postcss, Storybook 9 + addons, Radix primitives, next-themes, class-variance-authority, and shadcn-generated first-party source) enter the tree in one pack."
  impact: "A compromised or malicious transitive dependency in this larger surface is harder to audit as a batch than as incremental additions; shadcn-generated source in particular is copy-pasted into the repo and easy to skim past as 'boilerplate' in review."
  mitigation: "sec-deps-pinned-and-locked (spec.md) already requires pinned versions and lockfile commit; treat shadcn-generated component source as first-party code requiring the same review scrutiny as hand-written code, not as vendored/trusted boilerplate."

- severity: Medium
  description: "Token-purity lint gap (ADR-DS-6): no-direct-palette-import is JS-language-only; a raw hex or primitive reference introduced directly inside authored CSS (outside tokens.css) is not caught."
  impact: "A future contributor could add a one-off raw color in a .css file and pass npm run lint clean, silently reintroducing the exact drift the semantic-only rule (FR-3) exists to prevent."
  mitigation: "Scope this pack's CSS authorship to tokens.css (generated) only - no hand-authored component .css files should exist yet under shadcn+Tailwind's utility-class model. Revisit if that assumption changes."

- severity: Medium
  description: "Codegen staleness (ADR-DS-3): editing tokens.ts without running generate:tokens produces a stale tokens.css with no compile-time signal that the two are now out of sync."
  impact: "A developer's semantic-alias change silently fails to reach the live styling, producing a confusing 'I changed the token but nothing changed visually' debugging session."
  mitigation: "Wire generate:tokens into the build/precommit path so a stale tokens.css cannot reach a commit or a production build undetected."

- severity: Low
  description: "AA-contrast accepted risk (ADR-DS-4) on #7F56D9 in dark mode could be flagged by an external automated accessibility audit tool without the surrounding context (scoped usage, dark-mode --primary-strong escape hatch)."
  impact: "A future contributor or automated a11y scan sees a 'failure' without the accepted-risk rationale, and either 'fixes' it against D-4's fidelity intent or escalates unnecessarily."
  mitigation: "ADR-DS-4 is the durable record; reference it directly in code comments near --primary's definition in tokens.ts so the rationale travels with the token, not just in design.md."
```

## State Diagrams

Not warranted. This is a styling/tooling pack with no new entity carrying a
≥3-state lifecycle - the only stateful concept introduced is the light/dark theme
toggle (FR-9), a two-state switch (`next-themes` `class` strategy), not a state
machine with transitions/guards worth a `stateDiagram-v2`.
