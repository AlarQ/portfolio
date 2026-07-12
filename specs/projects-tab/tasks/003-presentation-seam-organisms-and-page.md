---
id: "003"
name: projectPresentation seam, ProjectTabStrip/ProjectSummary organisms, and pages/Projects
status: todo
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
