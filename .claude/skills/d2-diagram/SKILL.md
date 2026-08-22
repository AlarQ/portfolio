---
name: d2-diagram
description: Create or edit this repo's D2 diagram sources (content/diagrams/<name>.d2) so they argue visually instead of just displaying boxes. Use when the user wants to add/update a diagram rendered by <Diagram name="..." alt="..." /> on the site.
---

# D2 Diagram Author (portfolio repo)

Write and edit `content/diagrams/<name>.d2` sources that **argue visually**,
not just display information. A source declares structure - shapes, nesting,
edges - and a semantic class per shape. Layout is delegated to D2's `elk`
engine and style is delegated to the theme prelude, so the craft here is
*what to draw and how to say it*, not where to put it.

This skill carries the craft. The enforceable rules live in `CLAUDE.md` and
`specs/diagrams-d2/spec.md`; the gates that fail your commit live in
`scripts/diagram-lib/render.ts`. Read ADR-0005 for why the pipeline is what it
is.

## The three rules that fail your render — read first

1. **Never write a colour.** No hex, no `rgb(...)`, no `fill: white`. Colour
   reaches a diagram only through the closed class vocabulary below. The gate
   names the file and line.
2. **Only these classes exist**, and D2 ignores an unknown one silently (which
   is why the render fails instead):

   | class | means | note |
   |---|---|---|
   | `node` | the default box | |
   | `emphasis` | the one the scene is *about* | at most one or two per scene |
   | `terminal` | an end state | |
   | `group` | a container / boundary | put it on the container, not its children |
   | `planned` | not built yet | **modifier** - compose it: `class: [node; planned]` |
   | `stepper` | pins node width for a vertical chain | **modifier**, see below |
   | `edge` | a connection | |
   | `edge-feedback` | a loop-back / dashed return | |

   Role class **first**, modifiers after - D2 resolves last-in-list-wins.
3. **Nothing wider than 2:1.** A scene lands in a ~640px prose column; wider
   than 2:1 and it scales down to an illegible smear. The render fails with the
   measured ratio.

`content/diagrams/_reference.d2` is the exemplar board: every class, both edge
kinds, a container, the stepper idiom. Read it before authoring, and copy from
it rather than inventing style.

To change the *look* of every diagram, edit `scripts/diagram-lib/theme.ts`
(which resolves `src/theme/tokens.ts` primitives) - never a source file.

---

## Authoring conventions

- **Ids are short stable slugs; labels are always explicit.** Write
  `blocked: "blocked"`, never bare `blocked`. Edges and containers reference the
  id, so an id doubling as prose breaks every edge the day the wording changes.
- **Two-line labels are plain `"title\nsubtitle"`.** D2's `|md|` blocks render
  as a bare foreignObject with **no shape box** - a markdown label loses its box
  entirely. Both lines then carry the same weight; if the hierarchy matters,
  drop the second line instead of faking it.
- **Chains flow down.** `direction: right` is for chains of **3 nodes or
  fewer**. Anything longer gets `direction: down` plus the `stepper` modifier on
  every node (`class: [node; stepper]`), which pins node width and fills the
  column as a vertical stepper. Pinning width does not make a right-flowing
  chain narrower - edge labels hang beside the arrows and dominate the width.
- **Containers group; they do not lay out rows.** Nested per-container
  `direction` is **silently ignored** in this WASM build. Folding a chain into
  three containers to get three rows does not work - do not reach for it.
- **`grid-columns` is a trap for a sequence.** It hits the aspect budget by
  placing row-major, which reorders the argument: a 6-state flow reads across
  the top and back underneath, and labels collide.
- **Point an edge at a container, not into it,** when the relationship is with
  the whole thing. An arrow into a nested shape routes *through* the container's
  own title.
- **Never `**.class` at root.** It crashes the WASM build with a Go stack
  overflow and poisons the compiler instance. Scoped `<container>.**.class` and
  `*.class` are fine.

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

**For technical diagrams, use the real names** - see the Research Mandate below.

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
Parent-child branching. In D2 this is real container nesting, or a node with
one outgoing edge per child - never a hand-drawn trunk.
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
A boundary between sections - in D2, a container, or a phase named in each
step's own label. Use for: phase changes, boundaries.

---

> The pattern library above is about **argument shape**, and it predates D2. In
> a D2 source you express these through nesting, edge direction, and which node
> carries `emphasis` - not by drawing free-floating marks on a canvas. Where a
> pattern needs a canvas (freehand markers, spirals, overlapping clouds), pick
> the nearest structural equivalent: a cycle becomes an `edge-feedback` back to
> the first node, a side-by-side comparison becomes two sibling containers
> (which will stack vertically - say so in the labels), and a hierarchy becomes
> real nesting.

---

## Design Process (do this BEFORE writing any D2)

### Step 0: Assess depth required
Simple/conceptual (a mental model) vs. comprehensive/technical (concrete names,
real data). If comprehensive, research first.

### Step 1: Understand deeply
For each concept: what does it **DO**? What relationships exist? What is the
core transformation? What would someone need to **SEE** to understand it?

### Step 2: Map the concept to a structure

| If the concept... | Express it as |
|---|---|
| Spawns multiple outputs | one node with several outgoing edges |
| Combines inputs into one | several nodes edging into one `emphasis` node |
| Has hierarchy / nesting | real container nesting, `group` on the container |
| Is a sequence of steps | a vertical stepper (`direction: down` + `stepper`) |
| Loops or improves continuously | a chain plus one `edge-feedback` back to the start |
| Transforms input to output | a chain ending in `terminal` |
| Compares two things | two sibling containers - they stack, so label each side |
| Separates into phases | containers, or the phase named in each step's label |

### Step 3: Decide what the scene is ABOUT
Exactly one idea should carry `emphasis`. If you cannot name it, the diagram
does not have an argument yet.

### Step 4: Sketch the flow
Trace how the eye moves before you write the source: top to bottom for a
sequence, outside in for an architecture.

### Step 5: Write the source
Structure and classes only. Keep it short - a D2 source that needs scrolling is
usually a diagram that needs splitting.

### Step 6: Render and validate (MANDATORY)
Not optional, and not a final check - see below.

---

## Render & Validate (MANDATORY)

You cannot judge a diagram from its source. Auto-layout is exactly the part you
did not write, so you have to look at it.

### How to render

```bash
pnpm prerender:diagrams --preview
```

This re-renders **every** scene to `public/diagrams/<name>-{light,dark}.svg`
(the gates are cross-cutting, so all scenes are checked every run) and, because
of `--preview`, also rasterizes each to `.diagram-preview/<name>-<theme>.png` at
prose-column width - gitignored, and there purely because the Read tool renders
PNG, not SVG. The pre-commit hook runs the same command **without** `--preview`.

Then Read both:
- `.diagram-preview/<name>-light.png`
- `.diagram-preview/<name>-dark.png`

**Both themes, every time.** Dark is not hand-authored - fills collapse to the
card surface and the hue survives only in the stroke, so a scene that leans on
fill contrast can read fine in light and flat in dark.

If the command exits non-zero, read the error: it names the file and line for a
colour literal or an unknown class, and the measured ratio for an aspect
failure. Fix that first, before looking at anything else.

### The loop

1. **Render & view** - run the command, Read both PNGs.
2. **Audit against your design** - does the rendered structure match what you
   planned in Steps 1-4? Does the eye move in the order you intended? Is the
   `emphasis` node actually where attention lands?
3. **Check for defects** - text clipped or overflowing; edges crossing through
   shapes or through a container title; a label floating far from its arrow;
   a chain that staggered sideways; a container that ballooned; anything that
   reads worse in dark.
4. **Fix** - and note that your levers are *structural*: shorten a label, split
   a node, re-target an edge at the container, move a node into or out of a
   container, switch a right-flowing chain to a stepper. You cannot nudge
   coordinates; do not try.
5. **Re-render, re-view, repeat** - typically 2-4 iterations.

### When to stop

- The rendered scene matches the conceptual design, in **both** themes.
- No clipped, overlapping, or unreadable text.
- Edges connect the right things and route cleanly.
- You would show it to someone without caveats.

---

## Wiring it into a page

```mdx
<Diagram name="task-states" alt="..." />
```

`name` matches the source filename and must satisfy `^[a-z0-9-]+$` (so a
`_`-prefixed exemplar can never be embedded). `alt` is the **only** accessible
description - narrate the whole diagram, 1-3 sentences, the way the existing
corpus does.

**When you re-author an existing diagram, re-read its `alt`.** The alts are
long and specific, and a re-laid-out scene invalidates them - "two side-by-side
panels" stops being true the moment the panels stack.

There is no story per diagram: a `.d2` adds no component, and `Diagram.tsx` is
already storied. Storybook-first is not violated by this.

---

## Quality Checklist

### Depth & evidence (check first for technical diagrams)
1. **Research done**: real names, formats, and events - not placeholders?
2. **Concrete over abstract**: does it show what things actually are?
3. **Educational value**: could someone learn something concrete from this?

### Conceptual
4. **Isomorphism**: does the structure mirror the behaviour it describes?
5. **Argument**: does it show something text alone could not?
6. **One subject**: exactly one idea carries `emphasis`?
7. **No uniform grid**: not just N equal boxes in a row?

### Source discipline
8. **No colour anywhere** in the source?
9. **Every class from the closed vocabulary**, role first, modifiers after?
10. **Explicit labels on slug ids**?
11. **Plain `"title\nsubtitle"`** two-liners, never `|md|`?
12. **Chain longer than 3 nodes flows down** with the `stepper` modifier?

### Validation (render required)
13. **`pnpm prerender:diagrams --preview` exits zero** - no colour, class, or
    aspect failure?
14. **Both PNGs read and inspected**?
15. **No clipped text, no edge crossing a title, no stray label**?
16. **Reads as well in dark as in light**?
17. **`alt` still describes what actually rendered**?
