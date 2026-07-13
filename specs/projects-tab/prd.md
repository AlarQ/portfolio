# PRD — Projects tab

_Feature: `projects-tab` · tier: medium · track: feature · Status: explored (pre-/propose)_

## Problem

The site has no home for the owner's **Projects**. `/projects` is a 404 today, and the work the owner has built or is building is invisible to visitors. The concept is defined in `CONTEXT.md` (Project, Project Brief, MVP Progress, Status, Tech stack) and validated by a throwaway prototype (`src/app/projects-prototype/`, variant C won on mobile ergonomics), but nothing is wired into the real site. A recruiter landing on the portfolio cannot answer "what does this person build, and what's shipped?" in a fast scan.

## User & Value

- **Primary audience: recruiters / hiring** using the section as a fast **credibility scan** — they evaluate the owner professionally in seconds and, per UX research, largely judge from the inline summary without clicking through. Value: Status + MVP Progress + tech-stack badges are instantly scannable, ordered to lead with the strongest/Shipped work.
- **Secondary: technical peers** who want depth — served by the full MDX **Project Brief** and its related-**Post** deep-dives.
- **Secondary: the owner** sharing a specific Project in an application — served by the canonical per-Project URL `/projects/[slug]`.

Shortest path to value: a scannable index of Projects (currently homeless) at a real `/projects` route, joined into site nav.

## Scope

### In

- **Data layer** — a `Project` type + owner-authored data in `src/data/projects.ts` (typed, JSX-free, no hex/icons; mirrors `categories.ts`): title, slug, tagline, `status` (Exploring / In progress / Shipped), `mvpProgress` (0–100), `currentState`, `techStack` (icon/label keys), `relatedPosts` (Post slugs), **manual array order**. This is the authoritative slug set and the single slug-validation gate (`^[a-z0-9-]+$`, skip + build warning).
- **Presentation seam** — `src/utils/projectPresentation.tsx`: exhaustive `Record<Status,…>` (status → tone/label/dot, with `Exploring`/low-MVP → a `muted` tone) and `Record<TechKey, BadgeCategory>` (tech → one of the existing 8 Badge hues). A missing entry is a compile error.
- **Components (Storybook-first)** — `ui/` atoms `status-dot`, `tab-pill`, `meter`; `ds/` organisms `ProjectTabStrip` (owns `role="tablist"`, roving-tabIndex keyboard nav, sticky one-row scroll-snap rail, peek/fade affordance) and `ProjectSummary` (consumes presentation output only); composed by a `pages/Projects` screen that lifts active-slug state.
- **Index route** — a real `/projects` rendering `pages/Projects`: sticky pill strip + client-side inline **Project summary** swap + "Read full brief" link. First pill default-selected. `/projects` joins `navItems`.
- **Brief detail route** — `/projects/[slug]` MDX page mirroring `src/app/blog/[slug]/page.tsx`: dynamic-imports `content/projects/${slug}.mdx`, renders the body through the **existing** `mdxPresentation.tsx` seam (no new render path), `dynamicParams = false`, `generateStaticParams` maps only the `projects.ts` slug set. New `content/projects/` directory.
- **All lifecycle stages shown** (Shipped, In progress, Exploring), owner-curated order leading with the strongest; `Exploring`/low-MVP entries visually de-emphasised.
- **Accessibility** — the strip is a proper ARIA tablist (arrow/Home/End keys, focus management, survives 200% zoom); content swap respects `prefers-reduced-motion`; the MVP meter carries a legend/label so "40%" reads as "40% to first usable release."
- **Design tokens** — bind only semantic Tailwind utilities; the new `ui/meter` adds two semantic dimension tokens to `tokens.ts` (→ regenerate `tokens.css`, freshness test).
- **Testing** — unit tests for pure logic (presentation exhaustive Records, slug validation, ordering); Playwright e2e for `/projects` nav + pill switching + `/projects/[slug]` Brief render (chromium as reliable signal); Storybook covers visual states (both themes, a11y panel).
- **Cleanup** — delete `src/app/projects-prototype/` on completion.

### Out

- Per-Project **"approaches" slider** — deferred; prototype fixture (`_fixtures.ts`) deleted with the prototype folder. No data hook reserved.
- **`?project=` deep-link** on the index — the canonical `/projects/[slug]` Brief URL is the shareable per-Project link; index selection is ephemeral client state.
- External Project links (repo/demo/GitHub Pages) — Projects link only to on-site content (`CONTEXT.md`).
- Any CMS / DB / external input; `rehype-sanitize` + CSP (only required if MDX ever becomes non-owner-authored — the tripwire, not v1 work).
- Backend/API/schema work — none exists; static SSG only.

## Decisions Captured

- **D-1** — Project Brief is a real MDX page at `/projects/[slug]` for v1 (reverses the one-pager's "optional"); honors the `CONTEXT.md` glossary. See ADR-0002.
- **D-2** — Data split: typed structured fields in `src/data/projects.ts`, long-form body in `content/projects/[slug].mdx`, joined by slug. See ADR-0002.
- **D-3** — Brief bodies reuse the existing blog MDX pipeline + `mdxPresentation.tsx` seam; no second render path. See ADR-0001, ADR-0002.
- **D-4** — `projects.ts` is the single, authoritative slug-validation gate (`^[a-z0-9-]+$`); build enumerates from it, never globs `content/projects/`. MDX trust boundary extends unchanged to Briefs. See ADR-0002.
- **D-5** — Pill click swaps an inline **Project summary** client-side + "Read full brief" link; no full navigation from the strip.
- **D-6** — Pills ordered by manual array order in `projects.ts`; first pill default-selected; no `?project=`.
- **D-7** — All lifecycle stages shown, `Exploring`/low-MVP de-emphasised via a `muted` tone resolved in the presentation seam.
- **D-8** — New DS primitive `ui/meter` (with two new semantic dimension tokens); MVP meter fill uses `bg-primary`, not a status hue, keeping MVP% and Status visually independent.
- **D-9** — `CONTEXT.md` updated: "Project summary" (index card) and "Project Brief" (MDX page) are distinct terms.

## Open Questions for /propose

- Exact `TechKey` taxonomy and its mapping to the 8 Badge categories — hues are decorative and intentionally repeat past 8 keys; enumerate the initial key set in `spec.md`.
- Sticky-offset mechanism for the strip against the real `ds/Header` height, and the token-driven container-bleed (replacing the prototype's hardcoded `-mx-6 px-6`) — a design.md detail.
- Whether `ProjectSummary`'s desktop layout uses a right-rail meta block or a top meta-row — design.md.
- Missing-Brief handling: build warning vs hard fail when a Project slug has no `content/projects/[slug].mdx` — decide in spec.md (FR-level).
- Optional lightweight validation of the credibility-scan hypothesis (UX-suggested 5-second test) — process, not build; note only.

## Agent Insights (Explore Phase)

_All advisory — they enriched the conversation; decisions above are the owner's._

**UX Researcher** — Recruiters judge from the summary, rarely open the Brief (build it for depth-on-demand, not the scan). Horizontal pill scroll hides Projects past the fold on mobile → needs peek/fade + first-pill-renders-before-scroll. "Exploring"/low-MVP is double-edged → de-emphasise, don't hide; MVP% meter needs a legend so it doesn't read as "abandoned." A11y (ARIA tablist, keyboard, 200% zoom, reduced-motion) is a hard requirement. Cheap 5-second test validates the scan before over-investing in Briefs.

**Security Engineer** — No runtime injection surface (SSG, `dynamicParams=false`, slug set from `projects.ts`); a future runtime slug would reopen path traversal. MDX trust boundary inherits ADR-0001/0002 unchanged (tripwire: `rehype-sanitize` + CSP). Keep the `^[a-z0-9-]+$` gate identical to the blog's (no regex drift). Enumerate from `projects.ts`, never glob (orphan `.mdx` would publish). Spoofing / Repudiation / DoS = N/A.

**UX Architect** — 2 `ds/` organisms (`ProjectTabStrip`, `ProjectSummary`) over 3 `ui/` atoms (`status-dot`, `tab-pill`, `meter`); tab is a dumb atom, tablist/keyboard logic lives in the organism. `ui/meter` is a real DS gap (new atom + two dimension tokens; fill = `bg-primary`, not a status hue). Status/tech resolve in the seam via exhaustive Records; `Exploring` de-emphasis is a seam rule. Strip stays a one-row scroll-snap rail at all breakpoints; sticky offset must account for real Header height. Enumerated the required story states as the component contract (`lint:stories` gates route import).

**Backend Architect** — spawn flagged by keyword match but skipped: no backend/API/DB/server runtime exists (static SSG). Nothing to assess.

**Config Inferencer** — tier medium, track feature, per-task branching; gates lint/format-check/type-check/unit-test (blocking) + e2e (non-blocking). Flag: the pool's `unit-test` gate (`npm run test:unit`) may not have a matching script — verify before /validate.
