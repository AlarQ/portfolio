# Author page — identity rail prototype

Design exploration for the left-hand identity rail on `/author`
(`src/components/pages/Author.tsx`). Records the layouts tried, the decision,
and what is still open.

## Context

The rail is a sticky column beside the scrolling About / experience / Posts
content. It carries the owner's portrait, secondary gallery photos, and
name/title. All copy and image sources come from `src/data/profile.ts`
(FR-6 — never hardcoded in the component). Gallery photos are currently
placeholders (labeled tiles), so any layout has to look acceptable *before*
real images land.

## Layouts explored

| Variant | Shape | Verdict |
| --- | --- | --- |
| **B (baseline)** | Portrait, 3-col square thumb grid, name/title | **Shipped.** Clean, reads well with placeholders. |
| Polaroid stack | Portrait, then thumbs as tilted overlapping polaroid cards, straighten + lift on hover | Prototyped, then rejected — the tilt/overlap looked flat and busy with empty placeholder tiles. |

Also considered but not built: full-bleed portrait cover with overlaid
name/title, a portrait + 3-up stats band, and a duotone grayscale→color hover
grid. (The stats band idea was dropped along with the `profile.ts` `stats`
field — see "Current state".)

## Decision

Kept **variant B** (plain grid). The polaroid prototype was fully reverted —
`Author.tsx` is back to the shipped baseline, no remnants. Gates green
(`type-check`, `lint`, `Author.test.tsx`).

Rationale: the fanned/tilted treatments only pay off with real photography;
with placeholder tiles they add visual noise without benefit. Revisit the
polaroid or duotone ideas once real gallery images exist.

## Current state (productionized)

Variant B was hardened to production:

- **Rail extracted to an organism** — `src/components/ds/IdentityRail.tsx`
  (`Organisms/IdentityRail`), props-injected (never reads `profile.ts`) so its
  gallery placeholder-vs-real states are storyable in isolation. Ships with a
  sibling `IdentityRail.stories.tsx` (`Default`, `WithPhotos`, `LongName`,
  `Mobile`) and `IdentityRail.test.tsx` (portrait, identity text, both
  `GalleryImage` branches). `Author.tsx` now composes it instead of inlining the
  rail; `Pages.structure.test.tsx` asserts the `data-slot="identity-rail"`
  marker (compose-don't-reimplement guard).
- **`stats` dropped** — the `Stat` interface + `stats` field/data were removed
  from `src/data/profile.ts` (they restated CONTEXT.md's Domain Area example;
  author copy stays narrative). `experienceAreas` is documented as deliberately
  narrative prose, distinct from the Domain Area concept.
- **Token faithfulness** — page container `max-w-6xl` → `max-w-content`;
  highlight chips `rounded-full` → `rounded-pill`.
- Leftover `author-polaroid.png` screenshot removed.

## Open items

- **Real content** — replace placeholder bio and gallery photos in
  `src/data/profile.ts` (add `src` to each `galleryPhotos` entry under
  `public/images/`).
- **Dark-mode surface tokens (deferred follow-up)** — `semanticDark` still has
  no override for `--muted`/`--card`/`--card-foreground`/`--border`, so those
  surfaces (rail placeholder tiles, highlight chips, dividers) stay light in
  dark mode. The fix requires sourcing dark values from the Figma dark frame
  (node `614:679`) into `primitives` — inventing hex is forbidden — plus a
  repo-wide dark-toolbar regression sweep, so it was split out rather than
  bundled here. Placeholder/chip text works around it via
  `text-secondary-foreground` (theme-stable); revert to `text-muted-foreground`
  once the surface tokens land.
- **Revisit rail design** once real photos exist — polaroid/duotone were parked,
  not killed.
