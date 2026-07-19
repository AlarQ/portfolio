---
id: "004"
name: Wire /projects route, add nav item, and delete the prototype
status: done
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
implementer: engineering-frontend-developer
pr_url: https://github.com/AlarQ/portfolio/pull/82
---

## Objective
Add the server route at `src/app/projects/page.tsx` that mounts `pages/Projects` from the validated loader set, register `/projects` in `navItems.ts`, and delete `src/app/projects-prototype/` - shipping the live index that makes the prototype obsolete.

## Implements
| Kind      | Ref                                                     |
|-----------|----------------------------------------------------------|
| FR        | FR-4, FR-11                                              |
| Contract  | -                                                       |
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
- Add a chromium e2e (`nav-to-projects`, `pill-switch-summary`) asserting Read-full-brief link *presence*; the click-through render is Task 005's acceptance. Webkit/mobile have known pre-existing failures - chromium is the signal.

## Implementation Log

chunks_spawned: 2 (delegated to `engineering/frontend-developer`, K=3, 5-behavior backlog cut into [1-3] and [4-5])

### Design decisions
- **Header mounted by the route, not `pages/Projects`.** Task 003 shipped `pages/Projects` chrome-free (`{ projects }` only, no Header). Honoring `estimated_files` (lists `page.tsx`, not `Projects.tsx`), the new server route `src/app/projects/page.tsx` composes chrome - mirroring `src/app/author/page.tsx`: shell `flex min-h-dvh flex-col gap-10` → `Header items={navItems} activeHref="/projects"` → `<main className="flex-1 py-12">` → `Projects projects={buildProjectSet(projects)}` → `Footer`. `buildProjectSet` is the single slug-validation gate. `Footer` added for chrome parity with the Author mirror (omitting it would be a visible regression); `pages/Projects` left untouched.
- **`briefHref` deliberately not wired** (`pages/Projects` still passes no `briefHref`). The Brief route + `briefHref` resolution + orphan handling are Task 005 (FR-8/FR-9); `content/projects/` does not exist yet.

### Behaviors
- **1 - projects_link_lands_on_route_active_state_highlights**: added `{ href: "/projects", label: "Projects" }` to `src/data/navItems.ts` (removed its stale "/projects is a 404" docstring claim). `src/stories/fixtures/nav.ts` already contained `/projects` - no edit. `Header.test.tsx` gained a test importing the REAL `@/data/navItems`, asserting the Projects link renders + is active (`aria-current="page"`) under `activeHref="/projects"` (tests may import `src/data`; the page-agnostic rule constrains stories, not tests).
- **2 & 3 - sticky strip / first-pill / client-side pill swap**: already implemented inside `pages/Projects`/`ProjectTabStrip` (Task 003); the delta is `e2e/projects-index.spec.ts` (chromium-scoped) - nav→route+active-state, strip-above-summary via bounding-box + `projects.ts` order + first-pill-selected, and a client-side pill-swap test (`aria-selected` moves, summary text swaps, URL unchanged, no `framenavigated`). The pill-swap test is `test.skip`-guarded while `projects.ts` holds a single Project and auto-activates when a 2nd Project is added (no false-positive coverage).
- **4 - summary_shows_read_full_brief_link_to_slug_route**: coverage-confirmation only. The "Read full brief" → `/projects/[slug]` contract is already unit-tested in `src/components/ds/ProjectSummary.test.tsx` (renders when `briefHref` passed → `href="/projects/portfolio-site"`; omits when absent). No new/duplicate test added.
- **5 - prototype_directory_deleted_build_lint_typecheck_green**: `git rm -r src/app/projects-prototype/` removed all 10 files (page.tsx, _fixtures.ts, _shared.tsx, _PrototypeSwitcher.tsx, _ProjectsPrototype.tsx, _VariantA–D.tsx, NOTES.md). Repo grep confirmed no code/import/symbol stragglers; remaining `projects-prototype` string matches are only in spec/prd/task docs describing the removal. A stale gitignored `.next/dev/types/validator.ts` still referenced the deleted route and broke `tsc` + 3 `tsc`-shelling type-tests; deleting that generated file cleared all four (regenerates on next dev run).

### Refactor & gates
- Closing whole-diff refactor: reviewed the task-004 surface - route is minimal (12 lines, semantic tokens only), `navItems` is a 3-entry SoT, tests/e2e additive. The route's chrome-in-route divergence from `author/page.tsx` is the intentional chunk-1 decision, not duplication. No refactor applied.
- Final gates: type-check clean · lint clean · `build` success (route table shows `/projects`, no prototype route) · unit 292 passed / 1 pre-existing skip · e2e (`projects-index.spec.ts`, chromium) 2 passed / 1 conditionally skipped.
