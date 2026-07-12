# Projects tab — UI prototype

**Question:** What should the Projects tab look like? The brief floated two ideas
— (1) a switchable list where clicking a project changes the main content, and
(2) a slider to see "different approaches to the topic". Projects are cards, not
articles, and must show current state, status, and tech stack. Style must match
the existing blog.

**Route:** `/projects-prototype?variant=A|B|C` (throwaway — not the real
`/projects`). Flip with the floating bar or ← → arrow keys.

## Direction chosen

Master–detail (A) confirmed as the direction. Its weakness: on mobile the
single-column stack dumps the whole list on top and the chosen brief far below.
Round 2 keeps A as the baseline and explores three mobile-friendly takes on the
*same* master–detail idea. Old B (gallery/slider) and C (status board) were
rejected and deleted. All variants now share one `ProjectBrief` body.

## Variants

- **A — Split (desktop-first baseline).** List left, brief right. Great on
  desktop, poor on mobile (the flaw we're solving).
- **B — Accordion.** Full-width list; tapping a row expands the brief inline
  directly beneath it. Content appears *where you tapped* — identical on phone
  and desktop. Strongest pure-mobile answer.
- **C — Tab strip.** The list collapses to a sticky, horizontally scrollable row
  of pills; brief renders full-width below. Compact selector, one-tap switching,
  no scroll-up-through-a-list.
- **D — Split + mobile sheet.** Keeps A's exact desktop split; on phones a tap
  opens the brief in a bottom Sheet overlay instead of stacking. Best-of-both.

All reuse the design system (Card, Badge hues, semantic tokens, `max-w-content`,
real Header/Footer, `ui/sheet`) so they're judged at real density.

## Verdict

**Winner: C — Tab strip.** Sticky one-row pill selector + full-width brief below;
best mobile ergonomics with one-tap switching. Written up as a one-pager in
`features/projects-tab.md`. When picked up: build per the seam pattern (data →
presentation seam → Storybook-first components → real `/projects` route) and
delete this `src/app/projects-prototype/` folder.

## When done — cleanup

Delete `src/app/projects-prototype/` entirely. Nothing else imports it.
