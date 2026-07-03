# PRD — Blog Readability Pass (Docusaurus-inspired)

**Feature:** `blog-readability`
**Status:** Requirements (explore phase)
**Date:** 2026-07-02

## Summary

Improve readability and reader retention of the **Blog** (`/blog`, `/blog/[slug]`)
by borrowing proven patterns from [Docusaurus](https://docusaurus.io/) — **without
migrating frameworks**. The site stays Next.js 16 (App Router, SSG) + React 19 +
MUI 7, MDX-rendered **Posts**, and the existing data → presentation → component
seam architecture.

Docusaurus is a doc-first React static-site generator; a migration would discard
the MUI seam architecture and the hidden Projects/domains/skills portfolio
(retained per CLAUDE.md for later un-hiding). Its readability wins are **features**,
not framework magic — so we add the features to the existing Blog.

## User perspective

- **Who benefits:** readers of long-form **Posts** (currently a single Post,
  `my-spec-driven-workflow.mdx` — "Bounded Chaos") — and the owner, via better
  retention/shareability.
- **Problem solved:** long Posts have no in-page navigation, no way to deep-link a
  section, no path to the next Post, and no subscription channel. Typography is
  serviceable but unrefined.
- **Shortest path to value:** additive presentation/data work on the existing seam;
  no new trust surface, no backend.

## Scope

### In scope

1. **Table of contents (TOC) + heading anchors**
   - Auto-generated from Post `##`/`###` headings.
   - Sticky sidebar on desktop; collapses/hides on mobile.
   - Each heading gets a stable `id` and a hover-revealed anchor link for deep-linking.

2. **Prev/next Post navigation**
   - Links to adjacent Posts at the article foot.
   - Ordering source of truth already exists: `buildPostSet` orders by `date`
     (`src/data/postLoader.ts`). Adjacency is derived from that ordered set.

3. **Typography pass**
   - Refine measure, font size, heading rhythm, contrast, vertical spacing, and
     code-block readability at the presentation seam
     (`src/utils/mdxPresentationText.tsx`, `src/utils/mdxPresentationBlock.tsx`,
     `src/theme/theme.ts`). No hex/JSX added to data modules.

4. **RSS feed**
   - Static XML (e.g. Next.js route handler `src/app/feed.xml/route.ts`) generated
     at build from `getPosts()`. Absolute URLs require the site domain as config.
   - Output-only; no backend, no external input.

### Out of scope (explicitly rejected)

- **Reactions / thumbs up-down / comments** — every option needs a backend or a
  third-party service, breaking two documented architecture rules ("SSG, no CMS,
  no database" and the MDX "no external active content" trust model). If ever
  wanted, it is its own feature requiring an ADR that reverses those decisions.
- **Full Docusaurus migration** — discards MUI seam + hidden portfolio.
- **Search** (Algolia — external), **tags/authors pages**, **reading-time display**
  (note: `Post.readingTimeMinutes` is *already computed* by the loader; surfacing
  it is a trivial future add, not in this slice).

## Affected domains and modules

| Concern | Module |
|---|---|
| TOC heading extraction (build-time) | MDX pipeline in `next.config.ts` (add `rehype-slug` + heading-extraction), new data helper |
| TOC rendering | new `PostToc` component + `PostArticle` layout (prose + aside grid) |
| Prev/next data | `src/data/posts.ts` / `postLoader.ts` (adjacency over existing ordered set) |
| Prev/next rendering | new `PostNav` component at article foot |
| Typography | `mdxPresentationText.tsx`, `mdxPresentationBlock.tsx`, `theme.ts` (brand tokens) |
| RSS | new route handler consuming `getPosts()`; site-domain config |

Follows the seam pattern: types+data in `src/data/`, icon/color/JSX in a
`*Presentation` seam or `theme.ts`, rendering in components.

## Security implications

- **No new external input, no new trust surface.** All work is build-time
  transforms over **owner-authored** Posts, or output-only XML.
- **MDX trust boundary unchanged.** `rehype-slug` + heading extraction add `id`s to
  owner-authored headings; they do not admit external/PR-submitted MDX. Per
  CLAUDE.md and ADR-0001, `rehype-sanitize` + CSP are required **only** if the
  "owner-authored only" rule is relaxed — this slice does **not** relax it.
- STRIDE surface: negligible. No auth, no data handling, no user input.

## Testing expectations

- **e2e (Playwright, chromium reliable signal):** TOC renders and heading anchors
  resolve; prev/next links point to correct adjacent Posts; `/feed.xml` returns
  valid XML with expected Post entries.
- webkit/mobile suites have known pre-existing failures (profile-card h1 mismatch) —
  chromium is the trusted gate.
- Unit: adjacency derivation (first Post has no prev, last has no next); RSS entry
  mapping from `getPosts()`.

## Performance / scalability constraints

- SSG — all generation at build time; zero client cost beyond a small TOC component.
- TOC scroll-spy (if added) must respect `prefers-reduced-motion` (existing
  `usePrefersReducedMotion` hook) and stay cheap.

## Applicable ground rules

- **[code-quality]** pure functions, immutability, declarative `map`/`filter`,
  small modules (<100 lines), TypeScript strict, encode invariants in types.
- **[security-patterns]** validate at boundaries; no secrets; the site domain for
  RSS comes from config/env, not hardcoded.
- **[project/CLAUDE.md]** seam pattern; `brand` tokens are the single color seam;
  presentation seams own icon/color/JSX; MDX trust boundary must stay
  owner-authored (no CSP/sanitize needed since unchanged).

## Open items for /propose

- TOC heading-extraction mechanism under `@next/mdx` (remark/rehype plugin that
  exports a `toc` structure vs. a build-time parse helper).
- Where the site domain (RSS absolute URLs) is configured.
- Exact `PostArticle` responsive layout (grid breakpoints for aside vs. inline).

## Agent Insights (Explore Phase)

_Lightweight explore run — specialist agents not spawned; the above scope was
established via direct research (Docusaurus docs + web) and code inspection. Threat
surface, UX, and architecture trade-offs to be expanded in /propose._
