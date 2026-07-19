# MDX Mechanics Reference

The stable scaffold a Post is wired into. Voice is read live from the corpus (SKILL.md Step 1); this file is the part that *doesn't* change per post. Trust the code over this file if they ever drift - `src/data/postLoader.ts` is the authority.

## File & slug

- Post lives at `content/posts/<slug>.mdx`. The **slug is the filename minus `.mdx`** - there is no `slug` frontmatter field.
- The slug **must** match `^[a-z0-9-]+$` (lowercase letters, digits, hyphens). Anything else is silently skipped at load with a build warning - the Post just won't appear.
- Routes derive automatically: `/blog` (index) and `/blog/<slug>` (detail). No registration step.
- `readingTimeMinutes` and `formattedDate` are **derived** by the loader - never author them.

## Frontmatter schema

Parsed under YAML's JSON schema, so every value stays a string (an unquoted date is NOT auto-cast). Required fields fail the build if missing or empty.

```yaml
---
title: "The Seam Pattern"          # REQUIRED. The Post title.
dek: One domain concept, three...  # REQUIRED. The subtitle/standfirst - one strong sentence
                                   #   that states the payoff. This is the hook under the title.
date: 2026-05-20                   # REQUIRED. ISO YYYY-MM-DD (string). Drives ordering (newest first).
coverImage: /images/profile.jpg    # OPTIONAL. Site-relative path under public/ only (must start with /).
                                   #   External URLs, protocol-relative, or `..` traversal → dropped.
categories: [Engineering, Workflow]# OPTIONAL. Closed vocabulary (below). Unknown entries dropped w/ warning.
---
```

**Category vocabulary** (closed set - `src/data/categories.ts`): `Leadership`, `Management`, `Presentation`, `Engineering`, `AI`, `Workflow`. An unknown category is omitted (Post still publishes); it is not a synonym field - pick from these exactly.

`dek` is a real term (see `CONTEXT.md`) - it is the standfirst line. Write it as a claim, not a summary; the existing deks state the tension the post resolves.

## Body: available components

Standard Markdown renders through the presentation seam (`src/utils/mdxPresentation.tsx`) - headings, code fences with a language, blockquotes, lists, images, and links (external links are auto-hardened with `rel="noopener noreferrer"`). Beyond Markdown, exactly two authored components are in scope:

### `<Callout>`

An emphasized aside. Optional bold title, arbitrary body.

```mdx
<Callout title="[Human gate] Spec & tasks review">
Before a line of code gets written, I read the spec end to end. This is where I
catch a wrong contract while it's still cheap.
</Callout>
```

Props: `title?` (string), `children` (the body). Use it the way the corpus does - a genuine callout (a gate, a warning, a key aside), not to decorate every section.

### `<Diagram>`

A pre-rendered, theme-aware Mermaid diagram (build-time SVG - no browser at runtime).

```mdx
<Diagram name="task-states" alt="A task's state machine: from the start a task enters todo or blocked; blocked moves to todo once its dependency is done; ..." />
```

Props: `name` (string, must match `^[a-z0-9-]+$`), `alt` (string). The `alt` is the *only* accessible description - write it to fully narrate the diagram (the corpus deks run 1–3 sentences; match that thoroughness).

**Diagram workflow** (required whenever you use `<Diagram>`):

1. Author the source at `content/diagrams/<name>.mmd` in Mermaid syntax.
2. Assign **roles, not colours** - the theme palette is injected per-theme by `scripts/prerender-mermaid.ts` (the diagram presentation seam). Use `class <nodes> plan | build | verify` role classes as the existing `.mmd` files do; never hardcode hex.
3. Run `pnpm prerender:mermaid` to generate `public/diagrams/<name>-light.svg` and `-dark.svg`. A `<Diagram>` whose SVGs are missing throws at build.

## Trust boundary (do not cross)

Post bodies are rendered as **trusted content** - this holds ONLY because every Post is 100% owner-authored. `<script>` and `<iframe>` are neutralized to no-render on purpose. Do not author live third-party active content, and do not relax the pipeline (see `CLAUDE.md` → "MDX trust boundary" and ADR-0001). Introducing any external/PR-submitted MDX would require `rehype-sanitize` + a CSP first.

## Pre-ship check

- Slug matches `^[a-z0-9-]+$`; `title` / `dek` / `date` present and `date` is ISO.
- Any `<Diagram name>` has both prerendered SVGs (`pnpm prerender:mermaid` ran).
- `pnpm build` renders the Post with no `[posts]` frontmatter warning in the log.
