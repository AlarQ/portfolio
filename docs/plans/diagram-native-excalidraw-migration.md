# Plan — Migrate diagrams to native `.excalidraw` source (Master-Brain approach)

Repo: `/Users/ernestbednarczyk/Desktop/projects/portfolio` (branch `feat/excalidraw-diagrams`).
This plan is a self-contained handoff. A fresh session can execute it without prior conversation.

## Goal

Today a diagram's source of truth is a TypeScript builder spec (`content/diagrams/<name>.diagram.ts`)
compiled by `scripts/diagram-lib/builder.ts`. That is LLM-editable but **not human-editable in a GUI** —
the owner cannot drag a box in Excalidraw.

Make the source of truth a **native `content/diagrams/<name>.excalidraw` JSON scene** (the
`master-brain` repo's approach: `/Users/ernestbednarczyk/Desktop/projects/master-brain/.claude/skills/excalidraw/`).
Then:

- **Human edits**: open the `.excalidraw` file directly in excalidraw.com / the VS Code Excalidraw
  extension / Obsidian, drag things, save.
- **LLM edits**: edit the JSON directly, then render → view the PNG preview → fix, in a loop
  (master-brain's mandatory render-validate loop), guided by a new repo skill.

What must NOT be lost in the migration (these are CLAUDE.md invariants):

1. **Two themes from one source.** `<Diagram>` needs `public/diagrams/<name>-light.svg` AND
   `-dark.svg`. A raw `.excalidraw` file bakes in exactly one set of hexes.
2. **One palette, no ad-hoc colours.** Today enforced by the type system (`Record<Role, Hue>` is
   exhaustive → a missing role is a compile error). Raw JSON has no types, so this must become a
   **runtime validation gate** that fails the render.

The design that satisfies both: **author in the LIGHT palette; derive dark by an exhaustive
hex→hex swap at render time.** Any hex not in the light palette is a hard render error.

### Explicitly out of scope

- Do **not** port master-brain's Python renderer (`render_excalidraw.py`, `uv`, `pyproject.toml`).
  The repo already has a working Playwright/TS renderer that emits SVG (better than PNG for the
  site). Only the *method* (native JSON source + render-validate loop) is being adopted.
- `src/components/Diagram.tsx` keeps its public contract `<Diagram name="..." alt="..." />`.
  Only its doc comment changes.
- No changes to `next.config.ts`, the MDX pipeline, or any `content/posts/*.mdx` body.

---

## Current state (facts a fresh session needs)

Pipeline, all confirmed by reading the files:

- `content/diagrams/*.diagram.ts` — 6 specs: `feature-flow`, `hyperion-foundation`,
  `hyperion-monorepo-migration`, `learning-loop`, `task-states`, `validate-panel`.
  Each exports `name`, `alt`, `build(b: Builder)`.
  **`alt` is dead code** — `grep` confirms nothing reads it; every MDX call site passes its own
  `alt` prop to `<Diagram>`. It disappears in this migration; that is intended.
- `scripts/diagram-lib/builder.ts` (230 lines) — `Builder` class; methods `box`, `container`,
  `caption`, `arrow`, `row`, `scene()`. Emits Excalidraw element JSON with deterministic ids
  (`rect-1`, `text-2`, …) and constant `seed`/`versionNonce`/`updated` = 1, `roughness: 1`,
  `fontFamily: 1` (Virgil), `roundness: {type: 3}` on rects / `{type: 2}` on arrows.
  **This file is deleted at the end of the migration — but it is used first, to generate the seed
  `.excalidraw` files.**
- `scripts/diagram-lib/palette.ts` (109 lines) — role→hue tables per theme, resolved from
  `primitives` in `src/theme/tokens.ts`. Exports `Role`, `ThemeName`, `Swatch`, `roleSwatch`,
  `containerSwatch`, `frameColors`.
- `scripts/diagram-lib/render.ts` (89 lines) — `renderSceneToSvg(scene, theme)` / `closeRenderer()`.
  Launches headless Chromium (Playwright), `import()`s `@excalidraw/excalidraw@0.17.6` from
  `esm.sh` inside the page, calls `exportToSvg`, then inlines the Virgil/Cascadia woff2 fonts as
  base64 data URIs and rewrites `width="100%"` to the viewBox size.
  **Note:** it already never uses `exportWithDarkMode` — each theme gets its own fully-coloured
  scene. That is exactly the seam the hex-swap plugs into.
- `scripts/prerender-diagrams.ts` (145 lines) — walks `content/diagrams/*.diagram.ts`, staleness-gates
  on mtime (spec vs. output, plus an "engine mtime" = newest of the script, `src/theme/tokens.ts`,
  and every `scripts/diagram-lib/*.ts`), builds a `Builder` per theme, writes
  `public/diagrams/<name>-<theme>.svg`.
- `.husky/pre-commit` runs `pnpm prerender:diagrams && git add public/diagrams` (first line).
- `package.json`: `"prerender:diagrams": "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/prerender-diagrams.ts"`.
  Node runs `.ts` natively here — no build step, no ts-node.
- `src/components/Diagram.tsx` throws at build time if either SVG is missing.
- There are **no unit tests** touching the diagram pipeline (`find … *.test.ts* | xargs grep -l diagram`
  returns nothing). `e2e/blog-detail.spec.ts:56` mentions the pipeline in a comment only.

### The colour-swap collision (read this before writing `palette.ts`)

A naive `lightHex → darkHex` map is **ambiguous**, because in the light palette the *stroke* and the
*text* colour of a role are the same hex (e.g. `categoryIndigoFg` is used for both), but in dark they
diverge (stroke → `shikiTokenKeyword`, text → `bodyDark`).

Resolve by keying the map on **(hex, usage)**, where usage is derived from the element:

| Where the hex appears | Usage bucket |
|---|---|
| `backgroundColor` on any element | `fill` |
| `strokeColor` on an element of `type: "text"` | `text` |
| `strokeColor` on any non-text element (rectangle, arrow, line, ellipse, diamond) | `stroke` |

Three separate maps ⇒ no collisions possible. Also allow the literal `"transparent"` through
unchanged in every bucket (the builder emits it for text/arrow backgrounds).

The three maps, derived from the current `palette.ts` tables (light primitive → dark primitive):

- **fill**: `categoryVioletBg|categoryOrangeBg|categoryGreenBg|categoryIndigoBg|categoryGrayBlueBg → cardDark`;
  `gray50 → backgroundDark` (container); `white → backgroundDark`.
- **stroke**: `categoryVioletFg → shikiTokenFunction`; `categoryOrangeFg → shikiTokenConstant`;
  `categoryGreenFg → shikiTokenString`; `categoryIndigoFg → shikiTokenKeyword`;
  `categoryGrayBlueFg → shikiTokenKeyword`; `gray200 → borderDark` (container);
  `gray700 → bodyDark` (arrows/lines).
- **text**: every `category*Fg` → `bodyDark`; `bodyLight → bodyDark`; `gray700 → bodyDark`.

Build these maps from `primitives` in `src/theme/tokens.ts` by **primitive name**, never by pasted
hex literal — `palette.ts` already imports `primitives`, keep that. Hex literals stay banned outside
`primitives` (grit rule `grit/no-direct-palette-import.grit` covers `src/`; keep the discipline in
`scripts/` by construction).

---

## Implementation

### Step 0 — Generate the seed `.excalidraw` files (SEQUENTIAL, do this first)

Everything else depends on these existing, and this step uses the *old* `Builder`, which later
batches delete. **The orchestrator runs this alone, before dispatching any batch.**

Write a throwaway script (put it in the session scratchpad, NOT in the repo) that, for each
`content/diagrams/*.diagram.ts`:

```
import { Builder } from "<repo>/scripts/diagram-lib/builder.ts";
const mod = await import(specPath);
const b = new Builder("light");        // LIGHT is the authoring theme
mod.build(b);
writeFile(`content/diagrams/${mod.name}.excalidraw`, JSON.stringify(b.scene(), null, 2));
```

Run it with `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON <script>`. Result: 6 new files —
`feature-flow.excalidraw`, `hyperion-foundation.excalidraw`,
`hyperion-monorepo-migration.excalidraw`, `learning-loop.excalidraw`, `task-states.excalidraw`,
`validate-panel.excalidraw`.

`Builder.scene()` already emits the correct wrapper
(`{type:"excalidraw", version:2, source, elements, appState:{viewBackgroundColor:"transparent", gridSize:null}, files:{}}`),
so the output opens in Excalidraw as-is. **Do not hand-edit the geometry** — byte-identical output is
the whole point of the verification step.

Then delete the 6 `.diagram.ts` files (`git rm`).

### Batch A — Pipeline core (one implementation agent)

Files:

1. `scripts/diagram-lib/palette.ts` — **rewrite**. Remove `Role`, `roleSwatch`, `containerSwatch`,
   `frameColors` (nothing will import them once `builder.ts` is gone). Keep `ThemeName`. Add:
   - `LIGHT_ALLOWED: { fill: Set<string>; stroke: Set<string>; text: Set<string> }` — the legal light
     hexes per usage bucket, built from `primitives` by name.
   - `TO_DARK: { fill: Record<string,string>; stroke: Record<string,string>; text: Record<string,string> }` —
     the three maps above, built from `primitives` by name.
   - `export function darkenHex(hex: string, usage: "fill"|"stroke"|"text"): string` — returns `hex`
     unchanged for `"transparent"`; throws a descriptive error for any hex not in the map
     (message must name the offending hex, the usage bucket, and the legal set, e.g.
     `off-palette fill "#ff0000" — legal fills: #… (see docs/plans/… / the diagram skill)`).
2. **new** `scripts/diagram-lib/theme.ts` — `export function toDarkScene(scene: object): object`.
   Deep-clones the light scene and walks `elements`, rewriting `backgroundColor` via
   `darkenHex(_, "fill")` and `strokeColor` via `darkenHex(_, el.type === "text" ? "text" : "stroke")`.
   Leaves geometry, ids, bindings, `files` untouched. This is the *only* new concept in the pipeline.
3. `scripts/diagram-lib/render.ts` — mostly unchanged. Add one export:
   `export async function rasterizeSvg(svg: string, outPath: string): Promise<void>` — reuse the
   shared browser, `page.setContent(<html><body style="margin:0">${svg}</body></html>)`, screenshot
   the `<svg>` element to PNG at `deviceScaleFactor: 2`. This exists purely so the LLM render-validate
   loop has an image the Read tool can view (Read renders PNG, not SVG).
4. `scripts/prerender-diagrams.ts` — rewrite the discovery + build half; keep the staleness gate,
   the error handling (`failBrowser`, the `playwright install chromium` hint), and the logging shape.
   Changes:
   - Source glob: `*.excalidraw` instead of `*.diagram.ts`; `base` = filename minus extension
     (there is no `name` export any more). Skip any file starting with `_`.
   - Read + `JSON.parse` the file instead of `await import(...)`. A parse error must fail that
     diagram with a clear message, not crash the run.
   - Light scene = the parsed JSON as-is. Dark scene = `toDarkScene(parsed)`.
   - After writing each SVG, also write a preview PNG to `.diagram-preview/<base>-<theme>.png`
     via `rasterizeSvg` (create the dir; it is gitignored).
   - `LIB_DIR`/engine-mtime logic stays (it already globs `scripts/diagram-lib/*.ts`, so the new
     `theme.ts` is picked up for free).
5. `scripts/diagram-lib/builder.ts` — **delete** (`git rm`). Confirm no remaining importers first:
   `grep -rn "diagram-lib/builder" --exclude-dir=node_modules .` must return nothing.
6. `.gitignore` — add `.diagram-preview/`.
7. `package.json` — no new script strictly required (previews fall out of `prerender:diagrams`).
   If a preview-only entry point is wanted, add `"preview:diagrams": "pnpm prerender:diagrams"` —
   otherwise leave scripts untouched.

Constraint for this batch: **no hex literals** anywhere in `scripts/diagram-lib/` — resolve every
colour through `primitives` by primitive name.

### Batch B — Content + authoring aids (one implementation agent, parallel with A, C, D)

Files:

1. The 6 generated `content/diagrams/*.excalidraw` files — add nothing, they are generated verbatim
   in Step 0. This batch only *verifies* they parse and that no `.diagram.ts` remains.
2. **new** `content/diagrams/_palette.excalidraw` — a swatch sheet: one labelled rectangle per role
   (`plan`, `build`, `verify`, `ship`, `gate`, `agent`, `audit`, `sink`, `loop`) plus a `container`
   frame and a caption sample, all in the light palette. Purpose: the owner opens it in Excalidraw
   and copy-pastes a correctly-coloured shape rather than picking a colour from Excalidraw's default
   swatches (which would fail the render gate). Underscore prefix keeps it out of the render glob.
   Easiest correct way to produce it: a scratchpad script using the *pre-deletion* `Builder`
   (`b.box(...)` per role, `b.container(...)`, `b.caption(...)`) — so run it during Step 0 and let
   this batch just place/verify the file.

### Batch C — Docs (one implementation agent, parallel)

1. `CLAUDE.md` § "Diagrams" (currently line ~71) — rewrite. New content must state: diagrams are
   native `content/diagrams/<name>.excalidraw` scenes, hand-editable in any Excalidraw client and
   LLM-editable as JSON; they are authored in the **light** palette and the dark SVG is derived by
   `scripts/diagram-lib/theme.ts`'s exhaustive hex swap; an off-palette colour is a **render
   failure**, not a silent pass; copy shapes from `content/diagrams/_palette.excalidraw` rather than
   picking colours freehand; regenerate with `pnpm prerender:diagrams`; `<Diagram name="..." alt="..." />`
   is unchanged.
2. **new** `docs/adr/0004-native-excalidraw-source.md` — supersedes ADR-0003. Follow the existing ADR
   format in `docs/adr/0003-excalidraw-for-diagrams.md` (Status / Why / Considered options /
   Consequences). Must record:
   - Why: the builder spec was LLM-only; the owner needs direct GUI editing of the same artifact.
   - Considered + rejected: (a) keep the TS builder and accept no GUI editing; (b) two hand-authored
     files per diagram, one per theme — drift and double work; (c) drop dark diagrams — breaks the
     theme-tracking figure contract in `Diagram.tsx`.
   - Consequence: the palette invariant moves from **compile-time exhaustiveness** to a **runtime
     render gate**. This is a genuine weakening and must be named as such; the mitigation is that the
     gate fails the pre-commit hook, so an off-palette colour can never reach a committed SVG.
   - Consequence: colour semantics are now encoded as hexes in the scene, not as role names, so a
     diagram no longer self-documents its roles. `_palette.excalidraw` is the lookup.
   - Carry forward ADR-0003's still-true consequences: the `esm.sh` supply-chain note and the
     "render stays out of `next build` because Vercel is browserless" note.
   - Update `docs/adr/0003-excalidraw-for-diagrams.md` header to `Status: superseded by ADR-0004`.
3. `src/components/Diagram.tsx` — doc comment only: `content/diagrams/<name>.diagram.ts` →
   `content/diagrams/<name>.excalidraw`. No behaviour change.
4. `e2e/blog-detail.spec.ts:56` — comment mentions `content/diagrams/*.diagram.ts`; update the path.

### Batch D — Skills (one implementation agent, parallel)

1. **new** `.claude/skills/excalidraw-diagram/SKILL.md` — the LLM-editing half of the goal. Adapt
   `/Users/ernestbednarczyk/Desktop/projects/master-brain/.claude/skills/excalidraw/SKILL.md`
   (read it; it is the reference implementation). Keep its design methodology — diagrams argue rather
   than display, the depth assessment, the visual pattern library, container discipline, and above all
   the **mandatory render-view-fix loop**. Replace its repo-specific parts with this repo's:
   - Render command: `pnpm prerender:diagrams`, then **Read** `.diagram-preview/<name>-light.png`
     and `.diagram-preview/<name>-dark.png` — both themes must be checked, since dark is derived.
   - Colour rule: never invent a colour; use only the light-palette hexes, listed in the skill's
     `references/palette.md` (generate that file's contents from `scripts/diagram-lib/palette.ts` /
     `src/theme/tokens.ts` — role name, hex, and which usage bucket it belongs to).
   - Drop master-brain's `uv`/Python renderer setup section entirely.
   - Keep the section-by-section authoring guidance for large diagrams (the 32k output-limit
     constraint is real here too).
2. **new** `.claude/skills/excalidraw-diagram/references/palette.md` — the light palette table.
3. `.agents/skills/write-post/SKILL.md:64` and `.agents/skills/write-post/mdx-reference.md:61-63,72` —
   update the diagram-authoring steps: author `content/diagrams/<name>.excalidraw` (or invoke the
   new `excalidraw-diagram` skill), colours come from the light palette, run `pnpm prerender:diagrams`.
   Remove the "assign roles, not colours" wording, which no longer describes the artifact.

**File count is ~18 → the four batches above are the required parallel split.** Batches A–D touch
disjoint file sets and have no cross-batch edit dependencies (Batch D only *reads* `palette.ts`;
if Batch A has not landed yet, read `src/theme/tokens.ts` for the hexes).

---

## Verification

Run from the repo root, in order. Everything must pass before the review gate.

1. **No stragglers**
   ```bash
   ls content/diagrams/                      # 6 *.excalidraw + _palette.excalidraw, zero *.diagram.ts
   grep -rn "diagram-lib/builder\|\.diagram\.ts" --exclude-dir=node_modules --exclude-dir=.git .
   # expect: no hits outside docs/adr/0003 (historical) and docs/plans/
   ```
2. **Scenes parse**
   ```bash
   for f in content/diagrams/*.excalidraw; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" || echo "BAD $f"; done
   ```
3. **Byte-identical render (the core regression check).** Stash nothing; the current `public/diagrams/*.svg`
   in the working tree are the pre-migration renders.
   ```bash
   mkdir -p /tmp/svg-before && cp public/diagrams/*.svg /tmp/svg-before/
   touch content/diagrams/*.excalidraw          # force staleness
   pnpm prerender:diagrams
   diff -rq /tmp/svg-before public/diagrams
   ```
   **Expect zero differences.** The new pipeline replays the same scene the old `Builder` produced,
   so any diff means the hex-swap map or the light-scene generation is wrong. Investigate rather than
   accepting the diff. (If a diff appears only in dark SVGs, the bug is in `TO_DARK`; if it appears in
   light SVGs, Step 0's generation was not verbatim.)
4. **Preview PNGs exist and are viewable**
   ```bash
   ls .diagram-preview/          # 12 files: <name>-{light,dark}.png
   ```
   Then use the **Read** tool on `.diagram-preview/task-states-light.png` and
   `.diagram-preview/task-states-dark.png` and confirm they render legibly — this also proves the
   skill's validate loop actually works end to end.
5. **The off-palette gate actually fires.** Temporarily set one `backgroundColor` in
   `content/diagrams/task-states.excalidraw` to `"#ff0000"`, run `pnpm prerender:diagrams`, and
   confirm it exits non-zero with a message naming the hex and the usage bucket. **Revert the edit**
   and re-run to confirm green.
6. **Round-trip safety (manual, owner-facing — do it once).** Open
   `content/diagrams/task-states.excalidraw` in excalidraw.com, move one box, save over the file,
   re-run `pnpm prerender:diagrams`. It must succeed and the SVG must show the moved box.
   *Known gotcha to note in the ADR:* excalidraw.com ≥ 0.18 adds a fractional `index` field per
   element on save; the pinned `@excalidraw/excalidraw@0.17.6` renderer ignores unknown fields, so
   this is harmless — but if a save ever strips `boundElements` or `containerId`, labels will detach
   from their boxes. Verify those two fields survive the round trip.
7. **Repo gates**
   ```bash
   pnpm type-check
   pnpm lint
   pnpm test:unit
   pnpm build
   ```
   `pnpm build` must stay green — `Diagram.tsx` throws if any SVG is missing, so this proves all 6
   diagrams still resolve.
8. **Pre-commit hook still works** — staging the change and committing must run
   `pnpm prerender:diagrams && git add public/diagrams` without error (the hook is unchanged, but the
   script under it was rewritten).

---

## Review gate (MANDATORY)

After implementation and verification, dispatch these three agents **in parallel**, each given this
plan file plus the diff:

- **`odium`** — claim-vs-reality audit. Is every item above actually built and working? Specifically:
  are the 6 `.excalidraw` files real source (not leftovers), is `builder.ts` gone, does the
  off-palette gate genuinely throw, do both preview PNGs get written, is ADR-0003 marked superseded?
- **`code-quality-pragmatist`** — over-engineering check. Is `theme.ts` doing more than a hex walk?
  Is the palette module carrying dead exports from the old role API? Is the swatch file worth its
  keep?
- **`Code Reviewer`** — correctness, maintainability, security. Focus on the hex-swap exhaustiveness
  (an unmapped hex must throw, never silently pass through), the JSON parse path (no `any`, no
  unvalidated filesystem joins — `content/diagrams` is owner-authored but the glob should still not
  follow arbitrary paths), and that the ADR-0003 `esm.sh` supply-chain caveat is carried forward.

Findings are addressed before the work is considered done. Re-run the Verification section after any
fix.

## Ship

Once the gate is clean, invoke the **`quick-ship`** skill to commit, push, and open the PR. This is
the final step of the plan.
