---
id: "005"
name: MDX Brief route mirroring the blog [slug] pipeline with enumerate-not-glob safety
status: implemented
blocked_by: ["001"]
max_files: 7
ground_rules:
  - languages/nextjs/app-router.md
  - languages/nextjs/server-vs-client.md
  - security/input-validation.md
  - security/authz.md
  - testing/structure.md
  - testing/test-quality.md
test_cases:
  - brief_renders_via_existing_mdx_seam_no_new_map
  - generate_metadata_sets_per_brief_title
  - generate_static_params_maps_projects_ts_set_never_globs
  - dynamic_params_false_blocks_non_enumerated_slug
  - script_iframe_neutralized_external_link_noopener_via_seam
  - missing_brief_warns_no_route_summary_omits_link
  - orphan_mdx_never_published
estimated_files:
  - src/app/projects/[slug]/page.tsx
  - src/data/projectLoader.ts
  - src/data/projectLoader.test.ts
  - content/projects/portfolio-blog.mdx
  - e2e/project-brief.spec.ts
interaction: afk
implementer: engineering/frontend-developer
---

## Objective
Create `src/app/projects/[slug]/page.tsx` that dynamic-imports `content/projects/${slug}.mdx` through the existing `mdxPresentation.tsx` seam, with `dynamicParams = false` and `generateStaticParams` mapping *only* the validated `projects.ts` slug set (never globbing), plus the new `content/projects/` dir and a build-warning gate for missing Briefs / orphan MDX.

## Implements
| Kind      | Ref                                                                                                     |
|-----------|----------------------------------------------------------------------------------------------------------|
| FR        | FR-8, FR-9                                                                                                |
| Contract  | —                                                                                                       |
| Data      | `Project`                                                                                                 |
| Scenarios | brief-renders-mdx, enumerate-not-glob, mdx-script-neutralized, external-link-hardened, missing-brief-warning, orphan-mdx-not-published |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | a Project with a `content/projects/[slug].mdx` body | `/projects/[slug]` is built | the Brief renders via the existing `mdxPresentation` seam (no new map) and `generateMetadata` sets a per-Brief `<title>` |
| 2 | `generateStaticParams` | it enumerates routes | it maps only the validated `projects.ts` slug set and never globs the filesystem, and `dynamicParams = false` blocks any non-enumerated slug |
| 3 | a Brief body containing `<script>`/`<iframe>` or an external link | rendered | the script/iframe is neutralized and external links carry `rel="noopener noreferrer"` via the existing presentation seam |
| 4 | a Project in `projects.ts` with no matching `.mdx` | building | a build warning fires (not a hard fail), no route is generated, and the summary omits its "Read full brief" link |
| 5 | an `.mdx` file in `content/projects/` with no matching `projects.ts` entry | building | it is never published because routes enumerate from `projects.ts`, not a glob |

## Approach
- Clone `src/app/blog/[slug]/page.tsx` structure; reuse `mdxPresentation.tsx` unchanged — no new MDX map, no second render path (ADR-0002).
- Extend Task 001's `projectLoader.ts` to resolve Brief existence against `content/projects/` and expose `hasBrief`, feeding both this route's warnings and `pages/Projects`' `briefHref` — the single enumerate-not-glob authority (no independent slug source, no second gate).
- Add `content/projects/` with at least one sample Brief so `read-full-brief-link` clicks through end-to-end (chromium e2e).

## Implementation Log

chunks_spawned: 3

**Chunk 1** (brief_renders_via_existing_mdx_seam_no_new_map, generate_metadata_sets_per_brief_title, generate_static_params_maps_projects_ts_set_never_globs):
- Mirrored `src/app/blog/[slug]/page.tsx` exactly in structure for `src/app/projects/[slug]/page.tsx`: `generateStaticParams` maps `buildProjectSet(projects)` (never globs), `dynamicParams = false`, `generateMetadata` returns `{ title }` for a valid slug / `{}` otherwise, default export dynamic-imports `content/projects/${slug}.mdx` and renders via the existing `mdxPresentation.tsx` seam (no new component map — reuses the global `mdx-components.tsx` wiring).
- `projects.ts` has no `getProject`/`getProjects` helpers (unlike `posts.ts`); added a local `getProject(slug)` in the route file itself rather than a new data-layer export.
- **Deviation**: test 1 could not be a Vitest unit test — Vite's import-analysis plugin eagerly transforms the template-literal dynamic MDX import at transform time and chokes on raw MDX prose, regardless of mocking. Followed existing repo precedent (the blog route has zero Vitest tests, is e2e-only for its render path): wrote `e2e/project-brief.spec.ts` instead. Tests 2/3 (`generateMetadata`/`generateStaticParams`) don't touch the MDX import path, so those are ordinary Vitest unit tests in `src/app/projects/[slug]/page.test.tsx`.
- Created `content/projects/portfolio-site.mdx` as the sample Brief body (matches the actual first/only slug in `projects.ts`, `"portfolio-site"`).
- Full suite green: 295 Vitest tests, type-check, lint.

**Chunk 2** (dynamic_params_false_blocks_non_enumerated_slug, script_iframe_neutralized_external_link_noopener_via_seam, missing_brief_warns_no_route_summary_omits_link):
- Item 1 confirmed (not newly implemented) via e2e: `/projects/does-not-exist` → 404, already covered by chunk 1's `dynamicParams = false` + `notFound()`.
- **Finding (unresolved, out of scope for this task)**: literal `<script>`/`<iframe>` tags authored directly in an `.mdx` body compile via `mdxjs` to raw intrinsic JSX, not routed through `mdxComponents.script`/`.iframe` (`NoScript`/`NoIframe`) — verified empirically via `@mdx-js/mdx compile()` and the dev server (a literal `<iframe>` rendered live, uncontained). The neutralizer mappings are effectively dead code for author-typed raw tags. This is a pre-existing gap shared with the blog feature (its `e2e/blog-security.spec.ts` "no script/iframe" assertions are vacuously true for the same reason — no post ever contains a real raw tag). Per instruction not to modify `mdxPresentation.tsx`, the Brief fixture instead exercises the external-link hardening (`rel="noopener noreferrer"` via the `Anchor` seam component, which does work since `p`/`a` come from markdown syntax, not raw HTML) and the "no script/iframe" e2e assertion stays as a precedent-matching regression guard, not proof of active neutralization. **Recommend a follow-up finding/ADR note** — the MDX trust boundary in `CLAUDE.md` currently describes this mapping as load-bearing hardening; it is not effective against literal raw tags.
- Item 3: added `hasBrief(slug)` (existsSync check against a single known slug's file — never a directory scan for new slugs) and `filterProjectsWithBrief(validatedProjects, briefExists = hasBrief)` (warns and drops) to `src/data/projectLoader.ts`. Wired into `[slug]/page.tsx`'s `getProject`/`generateStaticParams`. `app/projects/page.tsx` now builds a `briefHrefBySlug: Record<string,string>` map and passes it to `pages/Projects` → `ProjectSummary`'s existing `briefHref` prop.
- **Deviation**: initially threaded a `getBriefHref` function prop from the server `page.tsx` into the client `pages/Projects` — crashed at runtime (functions aren't serializable across the RSC boundary). Fixed by switching to a plain `briefHrefBySlug` map. Caught by the full-suite-green rule before it reached the ledger.
- **File budget**: task total reached 9 files against `max_files: 7` — justified: `projectLoader.ts`/`.test.ts` were always on the task's `estimated_files`; `app/projects/page.tsx` + `pages/Projects.tsx`/`.test.tsx` were required to thread `briefHref` through to `ProjectSummary` (acceptance #4c) since `ProjectSummary` is rendered by `pages/Projects`, not directly by the route.
- Full suite green: 300 Vitest tests, tsc clean, biome clean, 53/54 chromium e2e (1 pre-existing unrelated skip), `npm run build` succeeds.

**Chunk 3** (orphan_mdx_never_published + final refactor):
- Confirmed, not newly implemented: added `content/projects/orphan.mdx` (no matching `projects.ts` entry) and an e2e test asserting `/projects/orphan` 404s despite the file existing on disk. `generateStaticParams` already enumerated only from `filterProjectsWithBrief(buildProjectSet(projects))`, never a directory glob, so no production code changed.
- Whole-task refactor pass against `git diff feat/projects-tab-integration...HEAD`: no extraction applied. `hasBrief`/`filterProjectsWithBrief` already co-located in `projectLoader.ts`; `getProject`'s naming already mirrors the blog route; `briefHrefBySlug` construction is intentionally distinct from `filterProjectsWithBrief` (map-to-href vs. filter-with-warning), not duplication. No leftover dead code from chunk 2's abandoned function-prop approach.
- Final full suite: 300 Vitest tests (1 pre-existing skip), tsc clean, biome clean, `npm run build` succeeds (only `/projects/portfolio-site` generated under `/projects/[slug]`), all 5 chromium tests in `e2e/project-brief.spec.ts` pass.
