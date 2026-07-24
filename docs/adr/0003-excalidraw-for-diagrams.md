# Excalidraw for Diagrams

Status: accepted

**Supersedes** the diagram-rendering decision noted in [ADR-0001](0001-mdx-for-blog-posts.md) (pre-rendered, theme-aware Mermaid SVGs via `scripts/prerender-mermaid.ts` and `<Diagram>`). Diagrams are now authored as role-tagged Excalidraw builder specs (`content/diagrams/*.diagram.ts`) instead of Mermaid source (`content/diagrams/*.mmd`); `<Diagram name="..." alt="..." />` (`src/components/Diagram.tsx`) is unchanged as the render seam.

## Why

Mermaid's rendered diagrams are structurally clean but visually generic - they read as auto-layout flowcharts, not as something the owner drew. Excalidraw's hand-drawn look better fits the site's authored, personal voice, and its library ecosystem (reusable shape/style presets) gives more control over layout than Mermaid's automatic graph placement without hand-rolling SVG.

## Considered options

- **Keep Mermaid, restyle via CSS/theming** - stays within the existing pipeline, but Mermaid's rendering is fundamentally graph-auto-layout; no amount of styling produces the hand-drawn look. Rejected.
- **Hand-author raw SVG per diagram** - full control, but reintroduces exactly the "bespoke render path per diagram" problem ADR-0001/0002 avoided, and drops the palette/role seam entirely. Rejected.
- **Excalidraw, driven by a builder-API spec per diagram** - chosen. Diagrams stay structured (a `.diagram.ts` module, not a drawn-and-exported binary blob), keep the semantic-role-not-color pattern, and render through the same `<Diagram>` seam.

## Consequences

- `content/diagrams/*.mmd` files and `scripts/prerender-mermaid.ts` are replaced by `content/diagrams/*.diagram.ts` builder specs and `scripts/diagram-lib/` (the new diagram-build toolchain), regenerated via `pnpm prerender:diagrams`. `next.config.ts`'s `rehype-mermaid` wiring is removed; MDX bodies never render diagrams live in-browser, matching the prior no-runtime-render constraint.
- **The palette seam is retained, not reinvented.** `scripts/diagram-lib/palette.ts` is the one place diagram colors resolve from `src/theme/tokens.ts` primitives, per theme (light/dark), the same seam pattern as Mermaid's `LIGHT_ROLES`/`DARK_ROLES`. Notably, this is a **per-theme resolution**, not Excalidraw's own `exportWithDarkMode` (which derives dark colors algorithmically from light ones) - the site's palette is the single source of truth for both themes, so `exportWithDarkMode` is deliberately not used. A `.diagram.ts` spec declares structure and a semantic role per node, never a color literal; adding a new visual category means adding a role to the palette, not a one-off style on a diagram.
- **New build-time dependency: network access to `esm.sh`.** The Excalidraw builder API is fetched from `esm.sh` at diagram-build time rather than vendored, so `pnpm prerender:diagrams` (and the pre-commit hook that runs it) requires network access when it actually rebuilds a diagram. This is mitigated by a staleness gate - a diagram is only rebuilt (and only then needs the network) when its `.diagram.ts` source changed since the last committed SVGs, so touching unrelated files or committing without diagram changes never requires network access.
- **Accepted supply-chain trust:** `scripts/diagram-lib/render.ts` dynamic-`import()`s an exact pinned version (`@excalidraw/excalidraw@0.17.6`) from `esm.sh` and fetches its font assets from the same host, with no subresource-integrity check - a compromised or MITM'd `esm.sh` response would be inlined straight into the committed, MDX-trust-boundary SVGs. This is accepted, not overlooked: the pin to an exact version bounds the blast radius to that one release, the fetch only runs locally at owner-authored commit time (never in CI/`next build`/at runtime), and the owner reviews the rendered SVG diff before committing. If this pipeline is ever automated (e.g. run in CI), pin/verify the fetch by hash first.
- Reversal cost: migrating away means rewriting every `.diagram.ts` spec and the `scripts/diagram-lib/` toolchain - meaningful, hence this ADR.
