# Diagram light palette

Every `.excalidraw` scene in this repo is authored **in the light theme only**.
The dark SVG is derived automatically at render time by
`scripts/diagram-lib/theme.ts`, which walks the light scene and swaps each
`backgroundColor`/`strokeColor` hex through an exhaustive lookup table owned
by `scripts/diagram-lib/palette.ts`. **Any hex not in this table is a hard
render error** — `pnpm prerender:diagrams` will throw, naming the offending
hex and the usage bucket, rather than silently passing an off-palette colour
through.

This means: never invent a colour, never eyedrop one from Excalidraw's
default swatches, never hand-type a hex you haven't checked against the table
below. Copy a shape from `content/diagrams/_palette.excalidraw` (the swatch
reference sheet) when you want a guaranteed-legal starting point, then only
change geometry/text — not colour.

## Usage buckets

A hex's legality depends on **where it's used**, because in the light scene
the stroke and text colour of a category happen to share a hex, but they
diverge once mapped to dark. Three buckets, no ambiguity:

| Element property | Bucket |
|---|---|
| `backgroundColor` on any element | `fill` |
| `strokeColor` on an element with `type: "text"` | `text` |
| `strokeColor` on any non-text element (rectangle, arrow, line, ellipse, diamond) | `stroke` |

`"transparent"` is always legal in every bucket (used for text/arrow
backgrounds) and passes through unchanged in dark.

## Category roles (shape fill/stroke/text)

These are the eight-ish Badge-style category hues. Historically each carried
a semantic role name (`plan`, `build`, `verify`, …) tied to the old TS
builder's `Record<Role, Hue>`; that type is gone, but the same hue groupings
are still the right way to think about which category a shape belongs to.
Use whichever category hue best fits the shape's meaning — there is no
longer a compile-time role assignment, just these seven legal fills paired
with their matching stroke/text hex.

| Category (former role examples) | Fill hex (`fill` bucket) | Stroke/Text hex (`stroke` + `text` buckets) |
|---|---|---|
| Violet — `verify`, `agent`, `loop` | `#f4f3ff` | `#5925dc` |
| Orange — `ship`, `audit` | `#fff6ed` | `#c4320a` |
| Green — `build`, `sink` | `#ecfdf3` | `#027a48` |
| Indigo — `plan` | `#eef4ff` | `#3538cd` |
| Gray-blue — `gate` | `#f8f9fc` | `#363f72` |

Each row's fill hex is legal in the `fill` bucket; its stroke/text hex is
legal in **both** the `stroke` bucket (non-text shape outlines) and the
`text` bucket (text element colour) — they're the same hex in light, they
diverge only in the derived dark scene.

## Container / frame hues

For the outer grouping "subgraph" container box and the scene's structural
lines/background:

| Purpose | Bucket | Hex |
|---|---|---|
| Container fill | `fill` | `#f9fafb` (gray50) |
| Container stroke | `stroke` | `#eaecf0` (gray200) |
| Container caption text | `text` | `#667085` (bodyLight) |
| Arrow / line stroke | `stroke` | `#344054` (gray700) |
| Arrow / line label text | `text` | `#344054` (gray700) |
| Scene / node background | `fill` | `#ffffff` (white) |

## Full legal-hex reference (light → dark mapping)

The dark hex is what the render pipeline produces automatically — you never
author it directly.

| Bucket | Light hex | → Dark hex |
|---|---|---|
| fill | `#f4f3ff` (categoryVioletBg) | `#111633` (cardDark) |
| fill | `#fff6ed` (categoryOrangeBg) | `#111633` (cardDark) |
| fill | `#ecfdf3` (categoryGreenBg) | `#111633` (cardDark) |
| fill | `#eef4ff` (categoryIndigoBg) | `#111633` (cardDark) |
| fill | `#f8f9fc` (categoryGrayBlueBg) | `#111633` (cardDark) |
| fill | `#f9fafb` (gray50, container) | `#090d1f` (backgroundDark) |
| fill | `#ffffff` (white, scene bg) | `#090d1f` (backgroundDark) |
| stroke | `#5925dc` (categoryVioletFg) | `#a855f7` (shikiTokenFunction) |
| stroke | `#c4320a` (categoryOrangeFg) | `#f97316` (shikiTokenConstant) |
| stroke | `#027a48` (categoryGreenFg) | `#84cc16` (shikiTokenString) |
| stroke | `#3538cd` (categoryIndigoFg) | `#38bdf8` (shikiTokenKeyword) |
| stroke | `#363f72` (categoryGrayBlueFg) | `#38bdf8` (shikiTokenKeyword) |
| stroke | `#eaecf0` (gray200, container) | `#242b47` (borderDark) |
| stroke | `#344054` (gray700, arrows/lines) | `#c0c5d0` (bodyDark) |
| text | `#5925dc` (categoryVioletFg) | `#c0c5d0` (bodyDark) |
| text | `#c4320a` (categoryOrangeFg) | `#c0c5d0` (bodyDark) |
| text | `#027a48` (categoryGreenFg) | `#c0c5d0` (bodyDark) |
| text | `#3538cd` (categoryIndigoFg) | `#c0c5d0` (bodyDark) |
| text | `#363f72` (categoryGrayBlueFg) | `#c0c5d0` (bodyDark) |
| text | `#667085` (bodyLight, container caption) | `#c0c5d0` (bodyDark) |
| text | `#344054` (gray700, arrow/line labels) | `#c0c5d0` (bodyDark) |
| any bucket | `transparent` | `transparent` (unchanged) |

Source of truth for all of the above: `scripts/diagram-lib/palette.ts`
(`FILL_TO_DARK`/`STROKE_TO_DARK`/`TEXT_TO_DARK`) and the primitive hex values
in `src/theme/tokens.ts`. If those files change, regenerate this table from
them rather than hand-editing a drifted copy.
