---
id: "004"
name: Wire /projects route, add nav item, and delete the prototype
status: blocked
blocked_by: ["003"]
max_files: 8
ground_rules:
  - languages/nextjs/app-router.md
  - languages/nextjs/server-vs-client.md
  - frontend/components.md
  - testing/structure.md
test_cases:
  - projects_link_lands_on_route_active_state_highlights
  - sticky_strip_above_summary_first_pill_selected_projects_order
  - pill_click_swaps_summary_client_side_no_navigation
  - summary_shows_read_full_brief_link_to_slug_route
  - prototype_directory_deleted_build_lint_typecheck_green
estimated_files:
  - src/app/projects/page.tsx
  - src/data/navItems.ts
  - src/stories/fixtures/nav.ts
  - src/components/ds/Header.test.tsx
  - e2e/projects-index.spec.ts
  - src/app/projects-prototype/page.tsx
interaction: afk
implementer: engineering/frontend-developer
---

## Objective
Add the server route at `src/app/projects/page.tsx` that mounts `pages/Projects` from the validated loader set, register `/projects` in `navItems.ts`, and delete `src/app/projects-prototype/` — shipping the live index that makes the prototype obsolete.

## Implements
| Kind      | Ref                                                     |
|-----------|----------------------------------------------------------|
| FR        | FR-4, FR-11                                              |
| Contract  | —                                                       |
| Data      | `Project`                                                |
| Scenarios | nav-to-projects, pill-switch-summary, read-full-brief-link |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | the site nav | the user clicks Projects | they land on `/projects` (previously a 404) and the `href === activeHref` check highlights the link |
| 2 | `/projects` loaded | it renders | the sticky pill strip appears above a full-width Project summary in `projects.ts` order, first pill selected, and pill clicks swap the summary client-side with no navigation |
| 3 | a Project whose Brief exists | its summary is shown | a "Read full brief" link points at `/projects/[slug]` |
| 4 | `src/app/projects-prototype/` (all variants, `_fixtures.ts`, `NOTES.md`) | the task completes | the directory is deleted with no approaches-slider carryover or reserved hook, and build/lint/type-check/e2e are green |

## Approach
- Server route stays thin (server/client boundary): it reads the loader's validated set and renders the client `pages/Projects`; the route resolves nothing visual.
- Add `{ href: "/projects", label: "Projects" }` to `navItems.ts` (single nav source of truth consumed by `ds/Header`); update the `src/stories/fixtures/nav.ts` fixture so Header stories stay in sync.
- Add a chromium e2e (`nav-to-projects`, `pill-switch-summary`) asserting Read-full-brief link *presence*; the click-through render is Task 005's acceptance. Webkit/mobile have known pre-existing failures — chromium is the signal.

## Implementation Log
