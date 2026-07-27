# Native `.excalidraw` Source for Diagrams

Status: accepted

**Supersedes** [ADR-0003](0003-excalidraw-for-diagrams.md) (role-tagged `content/diagrams/*.diagram.ts` builder specs compiled by `scripts/diagram-lib/builder.ts`). Diagrams are now authored as native `content/diagrams/<name>.excalidraw` JSON scenes; `<Diagram name="..." alt="..." />` (`src/components/Diagram.tsx`) is unchanged as the render seam.

## Why

The builder-spec format from ADR-0003 is LLM-editable (a TypeScript module an agent can write and diff) but not GUI-editable - the owner cannot open a `.diagram.ts` file in Excalidraw and drag a box. The owner needs to edit the same artifact that renders to the site directly, in any Excalidraw client (excalidraw.com, the VS Code extension, Obsidian), while keeping LLM-editing available as a plain JSON edit.

## Considered options

- **Keep the TypeScript builder, accept no GUI editing** - simplest, zero migration cost, but leaves the owner permanently dependent on an LLM (or hand-written TS) for every diagram change. Rejected.
- **Two hand-authored files per diagram, one per theme** - lets each theme be edited directly with no derivation step, but the two files inevitably drift (a shape moved in light and forgotten in dark), and it doubles authoring effort for every change. Rejected.
- **Drop dark-theme diagrams entirely, ship light only** - removes the drift problem by removing the second artifact, but breaks the theme-tracking figure contract `Diagram.tsx` guarantees (a `.dark`-driven light/dark swap with no client JS) for every diagram, not just new ones. Rejected.
- **Native `.excalidraw` JSON scene, authored in the light palette only, dark SVG derived by an exhaustive hex swap at render time** - chosen. One file per diagram, editable by hand or by LLM, with the dark variant guaranteed to track the light source because it is mechanically derived rather than separately authored.

## Consequences

- **The one-palette invariant moves from compile-time to a runtime render gate.** ADR-0003's `Record<Role, Hue>` was exhaustive at the TypeScript type level - a missing role was a compile error. A raw `.excalidraw` scene has no such type; there is no compiler to reject an off-palette hex picked freehand in the Excalidraw UI. This is a genuine weakening, named explicitly here, not glossed over. The mitigation: `darkenHex` in `scripts/diagram-lib/theme.ts` throws on any hex not in its light→dark map, and `.husky/pre-commit` runs `pnpm prerender:diagrams` before `git add public/diagrams` - so an off-palette colour fails the commit and can never reach a committed SVG.
- **Colour semantics are now hexes in the scene JSON, not role names.** A `.diagram.ts` spec self-documented its semantic roles (`plan`, `build`, `verify`, ...); a `.excalidraw` scene just has `backgroundColor: "#..."` with no attached meaning. `content/diagrams/_palette.excalidraw` is the lookup/reference sheet - a swatch sheet of correctly-coloured shapes the owner copies from instead of picking a colour from Excalidraw's own swatches.
- **New build-time dependency: network access to `esm.sh`, carried forward from ADR-0003.** `scripts/diagram-lib/render.ts` still dynamic-`import()`s a pinned `@excalidraw/excalidraw@0.17.6` from `esm.sh` inside a headless-Chromium render page, with no subresource-integrity check. As before, this is accepted rather than overlooked: the pin bounds the blast radius to one release, the fetch only runs locally at owner-authored commit time (gated by the same staleness check), and the owner reviews the rendered SVG diff before committing.
- **Render still stays out of `next build`, carried forward from ADR-0003.** Diagrams are rendered via a pre-commit step (headless Chromium), not during the Next.js build, because Vercel's build image is browserless. `<Diagram>` continues to throw at build time if either committed SVG is missing, so a missing render still fails loudly rather than shipping an empty figure.
- Reversal cost: migrating away means rewriting every `.excalidraw` scene and the `scripts/diagram-lib/` toolchain again - comparable to ADR-0003's own reversal cost, hence this ADR.
