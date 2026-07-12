---
id: "005"
name: MDX Brief route mirroring the blog [slug] pipeline with enumerate-not-glob safety
status: todo
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
