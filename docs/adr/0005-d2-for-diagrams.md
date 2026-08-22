# D2 for Diagrams

Status: accepted

**Supersedes** [ADR-0004](0004-native-excalidraw-source.md) (native `content/diagrams/<name>.excalidraw` JSON scenes rendered through headless Chromium) and, with it, the Excalidraw decision in [ADR-0003](0003-excalidraw-for-diagrams.md). Diagrams are now authored as `content/diagrams/<name>.d2` sources rendered by the `@terrastruct/d2` WASM build; `<Diagram name="..." alt="..." />` (`src/components/Diagram.tsx`) is unchanged as the render seam.

## Why

Excalidraw's hand-drawn look was chosen (ADR-0003) to read as "something the owner drew". In practice it reads as the least sharp thing on a site whose whole point is typographic precision - and the authoring cost is real: an `.excalidraw` scene is hand-laid-out JSON, so every layout change is a coordinate edit, and a freehand colour picked in the GUI fails the render. Auto-layout from a text source removes both problems at once: the source says what connects to what, the tool places it.

## Considered options

- **Restyle Excalidraw (drop the sketchiness, tighten the palette)** - cheapest, but keeps hand-laid coordinates and the headless-Chromium render, which is the part that hurts. Rejected.
- **Mermaid** - the pipeline this repo already left once; its output is generic and its theming surface is narrow. Rejected.
- **Graphviz** - excellent layout, but styling is a DOT-attribute grind and the output does not look designed. Rejected.
- **D2** - chosen. A declarative text source with real layout engines, a theming surface wide enough to hit the site's palette, and a pure-Go renderer with **no browser**: `@terrastruct/d2` is a WASM library, so the render step drops the headless Chromium and the `esm.sh` fetch that ADR-0003/0004 carried as accepted supply-chain risk.

## Consequences

- **Layout is delegated, so the aspect ratio becomes a gate, not a given.** Hand-laid Excalidraw scenes were sized for the ~640px prose column by construction; `elk` is not column-aware and spends width freely on edge labels. `scripts/diagram-lib/render.ts` therefore fails any scene whose rendered viewBox exceeds **2:1**, and left-to-right chains are re-authored as vertical steppers (`direction: down` plus a `stepper` modifier pinning node width). The accepted cost is height: `task-states` is ~1221px tall against the hand-laid original's 203px. Horizontal scroll was rejected - a diagram that needs dragging argues against the sharpness this change exists to deliver.
- **The palette gate gets stricter, not weaker.** ADR-0004's exhaustive light→dark hex swap threw on an off-palette colour. Its replacement is a flat rule: a `.d2` source may contain **no colour literal at all**. Colour reaches a diagram only through a closed vocabulary of semantic classes (`node`, `emphasis`, `terminal`, `group`, plus the `planned` and `stepper` modifiers and the two edge classes) defined in a prelude that resolves `src/theme/tokens.ts` primitives **by name** - a renamed primitive is a compile error. Because D2 silently ignores an unknown class, the vocabulary is gated too: a typo'd `class: termnal` fails the render instead of quietly drawing an unstyled box.
- **Two committed SVGs per scene, unchanged.** D2's own dark-theme output switches on `prefers-color-scheme`, which is the OS preference and not this site's `.dark` class, so the light/dark pair and the two-`<img>` swap survive intact.
- **The render is byte-deterministic**, so the committed SVGs are guarded the way generated `tokens.css` is: `src/theme/diagrams.test.ts` re-renders every scene and byte-compares, failing pre-push if a source was edited without re-rendering.
- **Diagram text is the site font by committed input.** D2 embeds a subset font per SVG and has no option to emit a bare `font-family`, so `scripts/diagram-lib/fonts/Inter-{Regular,Bold}.ttf` are vendored (OFL) and fed to the compiler. A font *package* could ship woff2-only and break the render; a committed input cannot drift from what the page serves.
- **No browser, no network, no CI step.** The render runs in exactly one place - the pre-commit hook - and needs neither Chromium nor `esm.sh`. `next build` still never renders a diagram, so Vercel's build image only ever sees committed SVGs.
- **Colour-coding capacity shrank on purpose.** One closed vocabulary serves all six scenes, with a fixed hue per role, so `bondsmith-architecture` lost its three-hue layer coding and carries that distinction through nesting and order instead. Six diagrams do not justify two vocabularies.
- Reversal cost: migrating away means re-authoring every `.d2` source and replacing `scripts/diagram-lib/` again - the same order of cost as ADR-0003 and ADR-0004, hence this ADR.
