# One-pager: Projects tab

_Status: idea, validated by prototype (`src/app/projects-prototype`, variant C). Not yet built._

## 1. The idea

A **Projects** section that presents each **Project** as a scannable brief — not
an article — showing what it is, its **current state**, its **status**, and its
**tech stack**. One Project is in focus at a time; a compact selector swaps the
main content between Projects (a master–detail pattern).

Chosen layout — **Tab strip (variant C):**

- A single **sticky, horizontally scrollable row of pills**, one per Project, at
  the top of the section. Each pill shows the Project title and a small status
  dot.
- Selecting a pill renders that Project's **brief full-width beneath** the strip.
- Because the strip is sticky and only one row tall, switching Projects is
  always one tap with no scroll-up-through-a-list — this is the reason it beat
  the vertical-split layout (which buried the list above a long detail on
  mobile).

## 2. Why this shape

- **Cards, not articles.** A Project is a status snapshot, not long-form prose.
  (Long-form lives in the **Blog** as **Posts**; a Project may *link* to related
  Posts — see `CONTEXT.md`.)
- **Mobile-first.** The compact one-row selector reads identically on phone and
  desktop; no awkward stacked list.
- **One focus at a time.** Keeps each brief roomy and readable instead of a wall
  of equal cards.

Rejected alternatives (from the prototype): a gallery grid + approaches slider,
a status-column board, and vertical master–detail splits. The tab strip won on
mobile ergonomics.

## 3. What one Project brief shows

| Field | Meaning (per `CONTEXT.md` glossary) |
|---|---|
| Title + tagline | Name and one-line pitch |
| **Status** | `Exploring` / `In progress` / `Shipped` — a coloured pill |
| **MVP Progress** | 0–100% meter — closeness to first usable release (not a done flag) |
| Current state | Short prose: what's happening right now |
| **Tech stack** | Badge chips (reuse the Badge category hues) |
| Related Posts | On-site links to deep-dive Posts (Project → Post only) |

## 4. How it fits the architecture (when built for real)

Follow the **seam pattern** — do **not** promote the prototype code as-is:

1. **Data** — add a `Project` type + data in `src/data/` (e.g. `projects.ts`):
   title, slug, tagline, `status`, `mvpProgress`, `currentState`, `techStack`
   (icon/label keys, **no hex, no JSX**), and related-Post slugs. This is the
   home of the Project concept, mirroring `domains.ts`.
2. **Presentation seam** — a `*Presentation.tsx` resolves `status` → colour/label
   and tech keys → Badge categories via an **exhaustive `Record`** (a missing
   entry is a compile error, like `skillPresentation`).
3. **Components** — `ds/` organisms (a `ProjectTabStrip` + a `ProjectBrief`)
   built **Storybook-first** (story before route usage; both themes; a11y panel),
   then composed by a `pages/Projects` screen.
4. **Route** — a real `/projects` route (currently a 404) renders `pages/Projects`
   with real Header/Footer, and `/projects` joins `navItems`.
5. Bind **only semantic tokens** (`bg-card`, `text-foreground`, `bg-badge-*`,
   `max-w-content`), never hex/palette imports (lint-enforced).

Optional follow-up (deferred): a per-Project **"approaches"** slider showing the
different ways a topic was tackled — prototyped earlier, data still stubbed in
`_fixtures.ts`, not part of the C layout. Add only if it earns its keep.

## 5. Open questions

- Ordering of pills — by status, by recency, or manual?
- Does a Project need its own **Project Brief** page (`/projects/[slug]`, MDX),
  or is the inline brief enough for v1?
- Deep-link a selected Project via `?project=` for shareable URLs?
- Empty/loading states — likely N/A (static SSG), confirm.

## 6. Next step

Delete `src/app/projects-prototype/` once this is picked up, and build per §4.
