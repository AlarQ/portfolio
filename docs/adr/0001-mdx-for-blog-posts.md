# MDX for Blog Posts

Status: accepted

The site previously had **no blog** and a hard rule (CLAUDE.md, CONTEXT.md): all content is self-authored, strongly-typed static data modules under `src/data/` - no CMS, no database, no `content/` directory. We are now building a real **Blog** of **Posts**, and we author Posts as **MDX files** under `content/posts/`, rendered at build time (SSG), rather than as TS data objects.

## Why

A **Post** is long-form prose, often with code blocks and the occasional inline component. Encoding paragraphs of markdown inside TypeScript string literals (the existing data-module pattern) is hostile to writing and reviewing. MDX gives prose-first authoring plus the option to drop in MUI/JSX components, and stays fully static (no CMS/DB) - preserving the "self-authored, no external input" constraint while relaxing only the "everything is a typed data module" rule.

## Considered options

- **Static data modules** (`src/data/posts.ts`, body as markdown string) - keeps 100% seam purity and zero new build deps, but makes authoring long prose painful. Rejected for writing ergonomics.
- **Plain markdown + frontmatter** (gray-matter) - prose-friendly, lighter than MDX, but loses inline components. Viable fallback; rejected because component-in-prose is wanted.
- **MDX** - chosen.

## Consequences

- Introduces an MDX build pipeline and a `content/posts/` directory - a deliberate, surprising deviation from the "no `content/` dir, typed-data-only" rule. This ADR is the record of *why* so a future reader doesn't "fix" it back to data modules.
- The presentation seam still applies to Post **metadata** (date formatting, list cards, any icons/colors → `brand` tokens); MDX owns only the body.
- Migrating away later means rewriting all Post files and the render pipeline - meaningful reversal cost, hence this ADR.
- **Code-block color is a second surface of the brand seam.** Syntax highlighting is build-time (rehype-pretty-code / Shiki, zero runtime JS). Shiki emits static HTML that cannot read the MUI runtime theme, so code-block colors resolve from CSS variables (`--shiki-*`) defined in `globals.css` and sourced from `theme.ts` `brand` tokens. The "single color seam" invariant is therefore preserved as *one source of truth in two surfaces* (MUI theme object + CSS vars), not as a single file. A future reader seeing color outside `theme.ts` should read this, not "fix" it.
