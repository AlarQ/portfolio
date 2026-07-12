---
id: "003"
name: projectPresentation seam, ProjectTabStrip/ProjectSummary organisms, and pages/Projects
status: in-progress
blocked_by: ["001", "002"]
max_files: 12
ground_rules:
  - frontend/components.md
  - frontend/accessibility.md
  - frontend/styling.md
  - languages/typescript/patterns.md
  - languages/nextjs/server-vs-client.md
  - testing/structure.md
  - testing/test-quality.md
test_cases:
  - seam_resolves_exploring_low_mvp_to_muted_tone
  - missing_status_or_techkey_record_entry_is_compile_error
  - arrow_home_end_move_selection_roving_tabindex_aria_selected
  - strip_stays_one_row_scroll_snap_with_peek_fade_at_200_zoom
  - pill_activation_swaps_summary_client_side_no_navigation
  - first_pill_selected_on_load
  - summary_swap_respects_prefers_reduced_motion
  - summary_renders_read_full_brief_link_only_when_briefhref_present
estimated_files:
  - src/utils/projectPresentation.tsx
  - src/utils/projectPresentation.test.tsx
  - src/components/ds/ProjectTabStrip.tsx
  - src/components/ds/ProjectTabStrip.stories.tsx
  - src/components/ds/ProjectTabStrip.test.tsx
  - src/components/ds/ProjectSummary.tsx
  - src/components/ds/ProjectSummary.stories.tsx
  - src/components/ds/ProjectSummary.test.tsx
  - src/components/pages/Projects.tsx
  - src/components/pages/Projects.stories.tsx
interaction: afk
implementer: engineering/frontend-developer
---

## Objective
Resolve `Status → {tone,label,dot}` and `TechKey → BadgeCategory` in `projectPresentation.tsx` (exhaustive `Record`s), then compose the atoms into an accessible `ProjectTabStrip` (owns `role="tablist"`, roving tabIndex, sticky one-row scroll-snap rail with peek/fade) and a `ProjectSummary`, lifted by `pages/Projects` — the whole interactive index experience, verified in Storybook before any route.

## Implements
| Kind      | Ref                                                                                                  |
|-----------|-------------------------------------------------------------------------------------------------------|
| FR        | FR-3, FR-5, FR-7                                                                                       |
| Contract  | —                                                                                                    |
| Data      | `Project`, `TechKey`                                                                                   |
| Scenarios | exploring-muted-tone, pill-switch-summary, first-pill-default, keyboard-tablist-nav, zoom-200-tablist, reduced-motion-swap, meter-legend-label |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | a Project with `status: "exploring"` and low `mvpProgress` | the seam resolves it | tone is `muted`, and a missing `Status` or `TechKey` `Record` entry is a compile error |
| 2 | the `ProjectTabStrip` in a `Pages/Projects` story | the user presses Arrow/Home/End with focus in the strip | roving tabIndex moves selection, `aria-selected` tracks the active tab, and focus is managed per ARIA tablist |
| 3 | the strip at 200% browser zoom | viewed | it stays a single scroll-snap row with a peek/fade affordance and remains operable |
| 4 | a pill is activated | the summary swaps | `pages/Projects` updates active-slug client-side with no navigation, the first pill is selected on load, and the swap respects `prefers-reduced-motion` |
| 5 | the active Project | `ProjectSummary` renders from seam output | it shows title, tagline, Status, MVP meter, current state, tech badges, related-Post links, and a "Read full brief" link only when `briefHref` is present |

## Approach
- The seam imports `StatusTone` from the `status-dot` atom and `BadgeCategory` from `badgeVariants.ts` — mirrors the `categoryPresentation`→`badgeVariants` seam; no icon/color resolution leaks into components.
- `ProjectTabStrip` composed from `tab-pill` + `status-dot`; all a11y/tablist logic lives here (atoms stay dumb). `ProjectSummary` renders one Project; `briefHref?` is fixture-driven in Storybook (present + absent states).
- Taxonomy `Organisms/…` + `Pages/Projects`; page-agnostic fixtures under `storybook-fixtures/`, no router deps (`lint:stories` gate before route import in Task 004).

## Implementation Log

chunks_spawned: 3

- `projectPresentation.tsx`: exhaustive `Record<Status, {tone, label}>` (`STATUS_PRESENTATION`) + exhaustive `Record<TechKey, BadgeCategory>` (`TECH_HUES`), mirroring `categoryPresentation.tsx`. `projectPresentation(status)` returns `{tone, label, dot}` (dot mirrors tone — no separate dot-icon concept, `status-dot` is a plain colored dot). `techPresentation(key)` resolves the Badge hue; hue assignments are decorative (no external requirement pinned specific hues), analogous to `BADGE_CATEGORIES` being decorative-only. Compile-time exhaustiveness proven via `projectPresentation.typetest.ts` (`@ts-expect-error` on invalid `Status`/`TechKey`), following the existing `*.typetest.ts` pattern.
- `ProjectTabStrip.tsx`: controlled organism (`projects`, `selectedSlug`, `onSelectSlug` — no internal selection state, mirrors `Pagination`'s controlled shape). `role="tablist"` wrapper; each tab is a real `<button role="tab">` (native focus/keyboard semantics) wrapping the `TabPill` atom (visual `selected` state, unchanged atom API/contract) + `StatusDot` (tone from the seam). Roving tabIndex (selected=0, others=-1); ArrowRight/Left wrap around, Home/End jump to first/last; `moveTo` calls `onSelectSlug` and imperatively focuses the target button ref, keeping focus and `aria-selected` in sync per ARIA APG tablist pattern.
- Deviation: `TabPill` (task 002) is a plain `<span>` with no `asChild`/Slot support, so button semantics were put on the wrapping `<button role="tab">` rather than forced onto the atom — keeps the atom's existing contract/story intact while still composing it as required.
- Scroll-snap + peek/fade: outer `relative` wrapper; tablist gained `flex-nowrap snap-x snap-mandatory overflow-x-auto scroll-smooth`, tabs `snap-start`. Trailing peek-fade overlay (`aria-hidden`, `pointer-events-none`, `bg-gradient-to-l from-background to-transparent` — semantic tokens only, no hex/arbitrary-color literals) hints more content instead of wrapping to multiple rows at 200% zoom.
- `pages/Projects.tsx`: `"use client"`, lifts `selectedSlug` state initialized to `projects[0]?.slug ?? ""` (array order authoritative per `projects.ts` doc comment) — satisfies first-pill-selected-on-load. Renders `ProjectTabStrip` (controlled) + `ProjectSummary` for the active project; swap is a pure `useState` update, no router import, no URL change.
- Reduced-motion swap: active `ProjectSummary` wrapped in a `key`-ed div with `motion-safe:transition-opacity motion-safe:duration-200 motion-reduce:transition-none` — Tailwind's native `motion-safe:`/`motion-reduce:` variants handle `prefers-reduced-motion`, no JS media-query polyfill needed.
- `ProjectSummary.tsx` fleshed out to full acceptance content: title, tagline, Status (`StatusDot` + label via `projectPresentation`), MVP meter (`Meter` atom fed `mvpProgress`), `currentState`, tech badges (`Badge` + `techPresentation` per `techStack` key, mirroring `SinglePost`'s `categoryPresentation` usage), related-Post links (`next/link` to `/blog/[slug]`), and a "Read full brief" link gated on a `briefHref?: string` prop. `briefHref` is deliberately a `ProjectSummary`-only prop (not on the `Project` domain type — a Project with no Brief body has no brief route, FR-9). Tech-badge and related-post sections render only when non-empty rather than an empty wrapper.
- Whole-task refactor pass (all 3 chunks' diff reviewed together): no duplication found — `techPresentation`/`projectPresentation` are single-owner seams consumed by both organisms without local re-derivation; `ProjectTabStrip`'s keyboard-nav functions stay small and separate from render; `Projects.tsx` stays minimal/page-agnostic (no router usage). No further changes needed.
- Full suite: 290 passed, 1 skipped (pre-existing, unrelated). `type-check`, `lint`, `lint:stories` all clean throughout.
