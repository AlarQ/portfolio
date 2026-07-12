# MDX for Project Briefs

Status: accepted

The **Projects** section (see `features/projects-tab.md`, prototype variant C) presents each **Project** as a scannable brief. A **Project Brief** is defined in `CONTEXT.md` as "the owner-authored, on-site description page for a single Project — rendered from MDX. Each Project has exactly one Brief." We now commit to building that page for v1: each Project gets a real `/projects/[slug]` route whose long-form body is an **MDX file** under `content/projects/`, reusing the blog's MDX pipeline and presentation seam ([ADR-0001](0001-mdx-for-blog-posts.md)).

The one-pager (`features/projects-tab.md §5`) had floated the Brief page as *optional* for v1, calling the tab-strip inline content "the brief." This ADR records the decision to **reverse that** and honor the glossary: the tab-strip inline content is a **Project summary** (a card view), distinct from the **Project Brief** (the MDX page). The `/projects` index selects a summary client-side and links into `/projects/[slug]` for the deep read.

## Why

A Project Brief is long-form prose with code blocks and the occasional inline component — the same authoring problem MDX already solves for Posts (ADR-0001). Building a second bespoke render path would duplicate the pipeline; reusing it keeps one MDX seam. Deferring the page (inline-summary-only) would have contradicted the already-committed `CONTEXT.md` model and left "Project Brief" as a defined-but-unbuilt term.

## Considered options

- **Inline summary only, defer the MDX page** — smallest v1 scope, but contradicts the `CONTEXT.md` glossary (which already commits each Project to exactly one MDX Brief) and forces renaming the reserved term. Rejected.
- **Store everything in MDX frontmatter** (mirror `postLoader` / `buildPostSet` end-to-end) — one source of truth per Project, closest to Posts. Rejected because the structured fields (status, mvpProgress, techStack, relatedPosts) are strongly-typed domain data that belong in a typed `src/data/` module per the seam pattern, not in stringly-typed frontmatter.
- **Split: typed data in `src/data/projects.ts`, body in `content/projects/[slug].mdx`, joined by slug** — chosen. Structured fields stay typed and JSX-free (like `domains.ts`); MDX owns only the Brief body.

## Consequences

- Adds a `content/projects/` directory and a `/projects/[slug]` route that dynamic-imports `content/projects/${slug}.mdx`, mirroring `src/app/blog/[slug]/page.tsx`. The Brief body renders through the **existing** `mdxPresentation.tsx` seam — no second MDX render path, no new body-element map.
- **The slug-validation gate moves to `src/data/projects.ts`.** Unlike Posts (whose validated slug set is derived from on-disk filenames by `buildPostSet`), a Project's authoritative identity is its typed record in `projects.ts`. That typed set is the single source of truth for `generateStaticParams`; the `^[a-z0-9-]+$` format check still gates each slug **before** any filesystem join so no arbitrary path can reach the dynamic import, and a Project whose `.mdx` body file is missing (or an orphan `.mdx` with no Project) is a build-time warning. `dynamicParams = false`, as with Posts.
- **The MDX trust boundary (`CLAUDE.md`) now extends to Project Briefs.** Brief bodies are trusted as rendered HTML/JSX ONLY while 100% owner-authored — identical to the Post assumption. External links are hardened and `<script>`/`<iframe>` neutralized by the shared `mdxPresentation.tsx` seam, so the protection holds by leverage, not author vigilance. If Project Briefs ever accept external/PR-submitted MDX, `rehype-sanitize` + a CSP are required before merge — same rule as Posts.
- The tab-strip inline content is a **Project summary**, a separate presentation from the Brief. `CONTEXT.md` is updated so "Project Brief" (MDX page) and the summary (card) do not collide in naming.
- Reversal cost: migrating away means rewriting all Brief `.mdx` files and the `/projects/[slug]` route — meaningful, hence this ADR.
