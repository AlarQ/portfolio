---
name: excalidraw-diagram
description: Create or edit this repo's Excalidraw diagram JSON scenes (content/diagrams/<name>.excalidraw) so they argue visually instead of just displaying boxes. Use when the user wants to add/update a diagram rendered by <Diagram name="..." alt="..." /> on the site.
---

# Excalidraw Diagram Creator (portfolio repo)

Generate/edit `content/diagrams/<name>.excalidraw` JSON scenes that **argue
visually**, not just display information. This is the LLM-editing half of the
diagram pipeline — the owner can also open the same file in excalidraw.com or
the VS Code Excalidraw extension and drag boxes by hand. Both paths write the
same artifact; there is no separate "spec" layer.

## Colour rule — read this before touching any hex

**Never invent a colour.** Every scene is authored in the **light** theme
only; `pnpm prerender:diagrams` derives the dark SVG automatically via an
exhaustive hex→hex swap (`scripts/diagram-lib/theme.ts` /
`scripts/diagram-lib/palette.ts`). A hex that isn't in the swap table is a
**hard render failure** — the build throws, naming the offending hex and
usage bucket, rather than silently letting an off-palette colour through.

Read `references/palette.md` before generating any diagram and use it as the
single source of truth for every fill/stroke/text hex. The easiest way to
guarantee a legal colour: open `content/diagrams/_palette.excalidraw` (the
swatch reference sheet) and copy-paste an existing labelled shape rather than
picking a colour freehand, then only edit its geometry and text.

To make this skill produce diagrams in a different style, edit
`references/palette.md` (and, upstream of that, `scripts/diagram-lib/palette.ts`
/ `src/theme/tokens.ts`, which are its source of truth) — everything else in
this file is universal design methodology and Excalidraw best practices.

---

## Core Philosophy

**Diagrams should ARGUE, not DISPLAY.**

A diagram isn't formatted text. It's a visual argument that shows
relationships, causality, and flow that words alone can't express. The shape
should BE the meaning.

**The Isomorphism Test**: If you removed all text, would the structure alone
communicate the concept? If not, redesign.

**The Education Test**: Could someone learn something concrete from this
diagram, or does it just label boxes? A good diagram teaches — it shows
actual formats, real event names, concrete examples.

---

## Depth Assessment (Do This First)

Before designing, determine what level of detail this diagram needs:

### Simple/Conceptual Diagrams
Use abstract shapes when:
- Explaining a mental model or philosophy
- The audience doesn't need technical specifics
- The concept IS the abstraction (e.g., "separation of concerns")

### Comprehensive/Technical Diagrams
Use concrete examples when:
- Diagramming a real system, protocol, or architecture
- The diagram will be used to teach or explain
- The audience needs to understand what things actually look like
- You're showing how multiple technologies integrate

**For technical diagrams, you MUST include evidence artifacts** (see below).

---

## Research Mandate (For Technical Diagrams)

**Before drawing anything technical, research the actual specifications.**

If you're diagramming a protocol, API, or framework:
1. Look up the actual JSON/data formats
2. Find the real event names, method names, or API endpoints
3. Understand how the pieces actually connect
4. Use real terminology, not generic placeholders

Bad: "Protocol" → "Frontend"
Good: "AG-UI streams events (RUN_STARTED, STATE_DELTA, A2UI_UPDATE)" →
"CopilotKit renders via createA2UIMessageRenderer()"

**Research makes diagrams accurate AND educational.**

---

## Evidence Artifacts

Evidence artifacts are concrete examples that prove your diagram is accurate
and help viewers learn. Include them in technical diagrams.

**Types of evidence artifacts** (choose what's relevant to your diagram):

| Artifact Type | When to Use | How to Render |
|---------------|-------------|---------------|
| **Code snippets** | APIs, integrations, implementation details | Dark rectangle + syntax-coloured text (see `references/palette.md`) |
| **Data/JSON examples** | Data formats, schemas, payloads | Dark rectangle + coloured text |
| **Event/step sequences** | Protocols, workflows, lifecycles | Timeline pattern (line + dots + labels) |
| **UI mockups** | Showing actual output/results | Nested rectangles mimicking real UI |
| **Real input content** | Showing what goes IN to a system | Rectangle with sample content visible |
| **API/method names** | Real function calls, endpoints | Use actual names from docs, not placeholders |

The key principle: **show what things actually look like**, not just what
they're called.

---

## Multi-Zoom Architecture

Comprehensive diagrams operate at multiple zoom levels simultaneously — like
a map that shows both country borders AND street names.

### Level 1: Summary Flow
A simplified overview showing the full pipeline or process at a glance.
Often placed at the top or bottom of the diagram.

### Level 2: Section Boundaries
Labeled regions that group related components — visual "rooms" that help
viewers understand what belongs together.

### Level 3: Detail Inside Sections
Evidence artifacts, code snippets, and concrete examples within each
section. This is where the educational value lives.

**For comprehensive diagrams, aim to include all three levels.**

### Bad vs Good

| Bad (Displaying) | Good (Arguing) |
|------------------|----------------|
| 5 equal boxes with labels | Each concept has a shape that mirrors its behavior |
| Card grid layout | Visual structure matches conceptual structure |
| Icons decorating text | Shapes that ARE the meaning |
| Same container for everything | Distinct visual vocabulary per concept |
| Everything in a box | Free-floating text with selective containers |

---

## Container vs. Free-Floating Text

**Not every piece of text needs a shape around it.** Default to
free-floating text. Add containers only when they serve a purpose.

| Use a Container When... | Use Free-Floating Text When... |
|------------------------|-------------------------------|
| It's the focal point of a section | It's a label or description |
| It needs visual grouping with other elements | It's supporting detail or metadata |
| Arrows need to connect to it | It describes something nearby |
| The shape itself carries meaning (decision diamond, etc.) | Typography alone creates sufficient hierarchy |
| It represents a distinct "thing" in the system | It's a section title, subtitle, or annotation |

**The container test**: For each boxed element, ask "Would this work as
free-floating text?" If yes, remove the container.

---

## Design Process (Do This BEFORE Generating JSON)

### Step 0: Assess Depth Required
Simple/Conceptual (abstract shapes, mental models) vs. Comprehensive/Technical
(concrete examples, real data). If comprehensive, research first.

### Step 1: Understand Deeply
For each concept: What does it **DO**? What relationships exist? What's the
core transformation or flow? What would someone need to **SEE** to
understand this?

### Step 2: Map Concepts to Patterns

| If the concept... | Use this pattern |
|-------------------|------------------|
| Spawns multiple outputs | **Fan-out** (radial arrows from center) |
| Combines inputs into one | **Convergence** (funnel, arrows merging) |
| Has hierarchy/nesting | **Tree** (lines + free-floating text) |
| Is a sequence of steps | **Timeline** (line + dots + free-floating labels) |
| Loops or improves continuously | **Spiral/Cycle** (arrow returning to start) |
| Is an abstract state or context | **Cloud** (overlapping ellipses) |
| Transforms input to output | **Assembly line** (before → process → after) |
| Compares two things | **Side-by-side** (parallel with contrast) |
| Separates into phases | **Gap/Break** (visual separation between sections) |

### Step 3: Ensure Variety
For multi-concept diagrams: each major concept must use a different visual
pattern. No uniform cards or grids.

### Step 4: Sketch the Flow
Before JSON, mentally trace how the eye moves through the diagram.

### Step 5: Generate JSON
Only now create the Excalidraw elements. See below for large diagrams.

### Step 6: Render & Validate (MANDATORY)
After generating the JSON, you MUST run the render-view-fix loop until the
diagram looks right in **both** themes. Not optional — see **Render &
Validate** below.

---

## Large / Comprehensive Diagram Strategy

**For comprehensive or technical diagrams, you MUST build the JSON one
section at a time.** Do NOT attempt to generate the entire file in a single
pass — this is a hard constraint, Claude Code has a ~32,000 token output
limit per response, and a comprehensive diagram easily exceeds that in one
shot. Even when it wouldn't, generating everything at once produces worse
quality. Section-by-section is better in every way.

### The Section-by-Section Workflow

**Phase 1: Build each section**

1. Create the base file with the JSON wrapper (`type`, `version`,
   `appState`, `files`) and the first section of elements.
2. Add one section per edit. Each section gets its own dedicated pass.
3. Use descriptive string IDs (e.g. `"trigger_rect"`, `"arrow_fan_left"`) so
   cross-section references are readable.
4. Namespace seeds by section (e.g. section 1 uses `100xxx`, section 2 uses
   `200xxx`) to avoid collisions.
5. Update cross-section bindings as you go — when a new section's element
   binds to an earlier element (e.g. a connecting arrow), edit that earlier
   element's `boundElements` array at the same time.

**Phase 2: Review the whole**

After all sections are in place, read through the complete JSON and check:
- Are cross-section arrows bound correctly on both ends?
- Is the overall spacing balanced?
- Do IDs and bindings all reference elements that actually exist?

**Phase 3: Render & validate**

Run the render-view-fix loop below. This is where you catch overlaps,
clipping, and imbalanced composition that aren't obvious from JSON.

### What NOT to Do

- **Don't generate the entire diagram in one response** — you will hit the
  output token limit and produce truncated, broken JSON.
- **Don't use a coding agent** to generate the JSON — it won't have
  sufficient context about this skill's rules.
- **Don't write a generator script for the JSON** — hand-crafted JSON with
  descriptive IDs is more maintainable than templating/coordinate math. (A
  throwaway scratchpad script is fine for one-off migrations; it is not how
  diagrams are normally authored or edited.)

---

## Visual Pattern Library

### Fan-Out (One-to-Many)
Central element with arrows radiating to multiple targets. Use for: sources,
root causes, central hubs.
```
        ○
       ↗
  □ → ○
       ↘
        ○
```

### Convergence (Many-to-One)
Multiple inputs merging through arrows to single output. Use for:
aggregation, funnels, synthesis.
```
  ○ ↘
  ○ → □
  ○ ↗
```

### Tree (Hierarchy)
Parent-child branching with connecting lines and free-floating text (no
boxes needed). Use `line` elements for the trunk and branches.
```
  label
  ├── label
  │   ├── label
  │   └── label
  └── label
```

### Spiral/Cycle (Continuous Loop)
Elements in sequence with arrow returning to start. Use for: feedback loops,
iterative processes.
```
  □ → □
  ↑     ↓
  □ ← □
```

### Cloud (Abstract State)
Overlapping ellipses with varied sizes. Use for: context, memory,
conversations, mental states.

### Assembly Line (Transformation)
Input → Process Box → Output with clear before/after.
```
  ○○○ → [PROCESS] → □□□
  chaos              order
```

### Side-by-Side (Comparison)
Two parallel structures with visual contrast. Use for: before/after,
options, trade-offs.

### Gap/Break (Separation)
Visual whitespace or barrier between sections. Use for: phase changes,
boundaries.

### Lines as Structure
Use `line` elements (not arrows) as primary structural elements instead of
boxes: timelines (line + small dot ellipses + free-floating labels), tree
trunks/branches, dashed dividers, or a central "flow spine".
```
Timeline:           Tree:
  ●─── Label 1        │
  │                   ├── item
  ●─── Label 2        │   ├── sub
  │                   │   └── sub
  ●─── Label 3        └── item
```

---

## Shape Meaning

Choose shape based on what it represents — or use no shape at all:

| Concept Type | Shape | Why |
|--------------|-------|-----|
| Labels, descriptions, details | **none** (free-floating text) | Typography creates hierarchy |
| Section titles, annotations | **none** (free-floating text) | Font size/weight is enough |
| Markers on a timeline | small `ellipse` (10-20px) | Visual anchor, not container |
| Start, trigger, input | `ellipse` | Soft, origin-like |
| End, output, result | `ellipse` | Completion, destination |
| Decision, condition | `diamond` | Classic decision symbol |
| Process, action, step | `rectangle` | Contained action |
| Abstract state, context | overlapping `ellipse` | Fuzzy, cloud-like |
| Hierarchy node | lines + text (no boxes) | Structure through lines |

**Rule**: Default to no container. Add shapes only when they carry meaning.
Aim for <30% of text elements to be inside containers.

---

## Colour as Meaning

Colours encode information, not decoration — see the **Colour rule** at the
top of this file and `references/palette.md` for the full legal set.

**Key principles:**
- Each category hue (violet/orange/green/indigo/gray-blue) has a specific
  fill/stroke/text combination — never mix a fill from one row with a
  stroke/text from another.
- Free-floating text uses colour for hierarchy (titles, subtitles, details —
  each at a different level, still drawn only from the palette).
- Evidence artifacts (code snippets, JSON examples) use their own dark
  background + coloured text scheme — pull those hexes from
  `references/palette.md` too, not from memory of a syntax theme.
- Always pair a darker stroke with a lighter fill for contrast.

**Do not invent new colours.** If a concept doesn't fit an existing category
hue, reuse the closest one — do not add a new hex to the scene without first
adding it to `scripts/diagram-lib/palette.ts` (a separate, deliberate change,
not something this skill does silently).

---

## Modern Aesthetics

### Roughness
- `roughness: 0` — Clean, crisp edges. Default for this repo's diagrams.
- `roughness: 1` — Hand-drawn, organic feel. Only if explicitly wanted.

### Stroke Width
- `strokeWidth: 1` — Thin, elegant. Lines, dividers, subtle connections.
- `strokeWidth: 2` — Standard. Shapes and primary arrows.
- `strokeWidth: 3` — Bold. Use sparingly for emphasis.

### Opacity
**Always use `opacity: 100` for all elements.** Use colour, size, and stroke
width to create hierarchy instead of transparency.

### Small Markers Instead of Shapes
Small dots (10-20px ellipses) as timeline markers, bullet points, connection
nodes, or visual anchors for free-floating text.

---

## Layout Principles

### Hierarchy Through Scale
- **Hero**: 300×150 - visual anchor, most important
- **Primary**: 180×90
- **Secondary**: 120×60
- **Small**: 60×40

### Whitespace = Importance
The most important element has the most empty space around it (200px+).

### Flow Direction
Guide the eye: typically left→right or top→bottom for sequences, radial for
hub-and-spoke.

### Connections Required
Position alone doesn't show relationships. If A relates to B, there must be
an arrow.

---

## Text Rules

**CRITICAL**: The JSON `text` property contains ONLY readable words.

```json
{
  "id": "myElement1",
  "text": "Start",
  "originalText": "Start"
}
```

Settings: `fontSize: 16`, `fontFamily: 3`, `textAlign: "center"`,
`verticalAlign: "middle"`.

---

## JSON Structure

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [...],
  "appState": {
    "viewBackgroundColor": "transparent",
    "gridSize": null
  },
  "files": {}
}
```

Diagrams here live at `content/diagrams/<name>.excalidraw` (JSON), not
`.mmd` or `.diagram.ts`. `content/diagrams/_palette.excalidraw` is a swatch
reference sheet — copy shapes from it rather than picking colours freehand.

---

## Render & Validate (MANDATORY)

You cannot judge a diagram from JSON alone. After generating or editing the
Excalidraw JSON, you MUST render it, view both theme outputs, and fix what
you see — in a loop until it's right. This is a core part of the workflow,
not a final check.

### How to Render

```bash
pnpm prerender:diagrams
```

This regenerates `public/diagrams/<name>-light.svg` / `-dark.svg` for every
`content/diagrams/*.excalidraw` scene, and also writes preview PNGs to
`.diagram-preview/<name>-light.png` and `.diagram-preview/<name>-dark.png`
(gitignored — these exist purely so the Read tool has something to view;
Read renders PNG, not SVG).

Then use the **Read tool** on both:
- `.diagram-preview/<name>-light.png`
- `.diagram-preview/<name>-dark.png`

**Both themes must be checked, every time.** The dark image is not
hand-authored — it's derived from the light scene by an exhaustive hex swap
(`scripts/diagram-lib/theme.ts`), so a light-only check can miss a dark
render that came out visually wrong even when the swap succeeded (e.g. a
role reused in a way that reads fine in light but muddies in dark).

If `pnpm prerender:diagrams` exits non-zero, read the error message — an
off-palette-hex error will name the exact hex and usage bucket; fix that hex
in the JSON (pick the correct row from `references/palette.md`) and rerun
before doing anything else.

### The Loop

After generating the initial JSON, run this cycle:

**1. Render & View** — Run `pnpm prerender:diagrams`, then Read both PNGs.

**2. Audit against your original vision** — Before looking for bugs,
compare the rendered result to what you designed in Steps 1-4. Ask:
- Does the visual structure match the conceptual structure you planned?
- Does each section use the pattern you intended (fan-out, convergence,
  timeline, etc.)?
- Does the eye flow through the diagram in the order you designed?
- Is the visual hierarchy correct — hero elements dominant, supporting
  elements smaller?
- For technical diagrams: are the evidence artifacts readable and properly
  placed?
- Does the dark render still read clearly — nothing muddy, nothing lost in
  the swap?

**3. Check for visual defects:**
- Text clipped by or overflowing its container
- Text or shapes overlapping other elements
- Arrows crossing through elements instead of routing around them
- Arrows landing on the wrong element or pointing into empty space
- Labels floating ambiguously (not clearly anchored to what they describe)
- Uneven spacing between elements that should be evenly spaced
- Sections with too much whitespace next to sections that are too cramped
- Text too small to read at the rendered size
- Overall composition feels lopsided or unbalanced
- Anything that looks fine in light but reads poorly in dark

**4. Fix** — Edit the JSON to address everything you found. Common fixes:
- Widen containers when text is clipped
- Adjust `x`/`y` coordinates to fix spacing and alignment
- Add intermediate waypoints to arrow `points` arrays to route around
  elements
- Reposition labels closer to the element they describe
- Resize elements to rebalance visual weight across sections
- Swap a hex for a different (still-legal) row in `references/palette.md`
  if a colour reads poorly in dark

**5. Re-render & re-view** — Run `pnpm prerender:diagrams` again and Read
both new PNGs.

**6. Repeat** — Keep cycling until the diagram passes both the vision check
(Step 2) and the defect check (Step 3), in **both** themes. Typically takes
2-4 iterations. Don't stop after one pass just because there are no critical
bugs — if the composition could be better, improve it.

### When to Stop

The loop is done when:
- The rendered diagram matches the conceptual design from your planning
  steps, in both light and dark
- No text is clipped, overlapping, or unreadable in either theme
- Arrows route cleanly and connect to the right elements
- Spacing is consistent and the composition is balanced
- You'd be comfortable showing it to someone without caveats

---

## Quality Checklist

### Depth & Evidence (Check First for Technical Diagrams)
1. **Research done**: Did you look up actual specs, formats, event names?
2. **Evidence artifacts**: Are there code snippets, JSON examples, or real data?
3. **Multi-zoom**: Does it have summary flow + section boundaries + detail?
4. **Concrete over abstract**: Real content shown, not just labeled boxes?
5. **Educational value**: Could someone learn something concrete from this?

### Conceptual
6. **Isomorphism**: Does each visual structure mirror its concept's behavior?
7. **Argument**: Does the diagram SHOW something text alone couldn't?
8. **Variety**: Does each major concept use a different visual pattern?
9. **No uniform containers**: Avoided card grids and equal boxes?

### Container Discipline
10. **Minimal containers**: Could any boxed element work as free-floating text instead?
11. **Lines as structure**: Are tree/timeline patterns using lines + text rather than boxes?
12. **Typography hierarchy**: Are font size and colour creating visual hierarchy (reducing need for boxes)?

### Colour
13. **Palette-only**: Every hex used appears in `references/palette.md`?
14. **Bucket-correct**: Fill/stroke/text hexes match the right bucket for
    their element (never a text-bucket hex used as a `backgroundColor`)?
15. **No freehand picks**: Colours came from `references/palette.md` or
    `content/diagrams/_palette.excalidraw`, not Excalidraw's default swatches?

### Structural
16. **Connections**: Every relationship has an arrow or line
17. **Flow**: Clear visual path for the eye to follow
18. **Hierarchy**: Important elements are larger/more isolated

### Technical
19. **Text clean**: `text` contains only readable words
20. **Font**: `fontFamily: 3`
21. **Roughness**: `roughness: 0` for clean/modern (unless hand-drawn style requested)
22. **Opacity**: `opacity: 100` for all elements (no transparency)
23. **Container ratio**: <30% of text elements should be inside containers

### Visual Validation (Render Required)
24. **Rendered via `pnpm prerender:diagrams`**: exits zero, no off-palette errors
25. **Both PNGs viewed**: `.diagram-preview/<name>-light.png` AND `-dark.png` read and inspected
26. **No text overflow**: All text fits within its container, both themes
27. **No overlapping elements**: Shapes and text don't overlap unintentionally
28. **Even spacing**: Similar elements have consistent spacing
29. **Arrows land correctly**: Arrows connect to intended elements without crossing others
30. **Readable at export size**: Text is legible in the rendered PNG, both themes
31. **Balanced composition**: No large empty voids or overcrowded regions
