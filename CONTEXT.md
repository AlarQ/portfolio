# Portfolio

Personal portfolio site presenting the owner's work, expertise, and current focus. Content is curated and self-authored; there is no external audience input or persistence.

## Language

**Project**:
A piece of work the owner built or is building, at any point in its lifecycle (shipped or in progress); maturity is tracked as MVP Progress. Presented to readers via its own **Project Brief**, and references zero or more related **Posts** (technical deep-dives), surfaced on the Project's card as labeled links. Projects link only to on-site content — no external repo/demo/GitHub Pages links.
_Avoid_: Showcase, demo, portfolio piece

**Project Brief**:
The owner-authored, on-site description page for a single **Project** — public-facing documentation of what the Project is, rendered from MDX at `/projects/[slug]`. Distinct from a **Post**: a Brief documents a Project; a Post is standalone blog writing. Each Project has exactly one Brief. The Brief's long-form body lives in `content/projects/[slug].mdx`; its structured fields live in `src/data/projects.ts` (see [ADR-0002](docs/adr/0002-mdx-project-briefs.md)). Distinct from the **Project summary** below — the Brief is the deep page, the summary is the card.
_Avoid_: Article, post, readme, showcase, case study

**Project summary**:
The compact card view of a **Project** shown inline on the `/projects` index (tab-strip layout): title, tagline, **Status**, **MVP Progress**, current state, tech grouped per **Repo**, and a row of small `ui/card`-based cards linking to related **Post**s (rendered only when the Project has `relatedPosts`). Rendered from the typed fields in `src/data/projects.ts` — it carries no long-form prose and no MDX. Selecting a pill swaps the summary client-side. Not a synonym for Brief — the summary is the index card, the Brief is the page, and the summary no longer links to the Brief.
_Avoid_: Brief, card, tile, preview

**Repo**:
A source repository comprising a **Project**, carrying a role (**Frontend**/**Backend**) and its own subset of the **Tech stack**. A Project has one or more Repos; single-Repo Projects render an unlabeled badge row, multi-Repo Projects show a role-labeled row per Repo. Structural grouping only — it does **not** introduce an external link (the "Projects link only to on-site content" rule still holds); the split is shown as grouped tech badges, never a GitHub URL. Not to be confused with the forbidden external repo link mentioned under **Project**.
_Avoid_: Repository link, GitHub link, source link

**MVP Progress**:
A percentage expressing how close a **Project** is to its first usable release; a maturity indicator, not a binary shipped/unshipped flag.
_Avoid_: Completion, status, done

**Domain Area**:
A field of expertise the owner works in (e.g. Leadership, Backend). Evidenced by **Achievements** and rated by **Skills** — the two are different views of the same area.
_Avoid_: Discipline, category, specialty

**Achievement**:
A concrete thing the owner did or delivered within a **Domain Area** — past, outcome-oriented.
_Avoid_: Accomplishment, highlight, win

**Skill**:
A durable capability the owner holds within a **Domain Area**, carrying a level and optional years of experience — present, rated.
_Avoid_: Competency, ability, expertise

**Reading**:
A book the owner is reading right now. Scoped to active reading only — finished or queued books are not modeled.
_Avoid_: Bookshelf, library, reading list, book tracker

**Topic**:
The owner's single current learning/exploration focus. Singular by design — exactly one at a time.
_Avoid_: Interests, subjects, focus areas

**Post**:
A single published piece of writing on the **Blog**, authored as MDX. Self-contained — a Post references nothing itself, though a **Project** may reference Posts as its related deep-dives (the link points Project→Post, never the reverse). Published-only: a Post that exists is live (presence in `content/posts/` = published); there is no draft state in the model.
_Avoid_: Article, entry, blog post, writing

**Blog**:
The collection of **Posts** and the section of the site that lists and renders them. The container; a **Post** is one item in it.
_Avoid_: Journal, news, articles section

## Relationships

- A **Project** has exactly one **MVP Progress**, exactly one **Project Brief**, and references zero or more related **Posts**
- A **Domain Area** is evidenced by zero or more **Achievements** and rated by zero or more **Skills**
- An **Achievement** and a **Skill** describe the same **Domain Area** from different angles (did vs. can)
- There is exactly one current **Topic** and zero or more current **Reading** items
- A **Blog** contains zero or more **Posts**; a **Post** belongs to exactly one **Blog** and references no other concept

## Example dialogue

> **Dev:** "Should a finished book move into a 'past reading' list?"
> **Owner:** "No — **Reading** is only what I'm reading now. A finished book just leaves; we don't track history."
>
> **Dev:** "Leadership shows up as both an **Achievement** group and a **Skill** category. Same thing?"
> **Owner:** "Same **Domain Area**. The **Achievement** is proof I led 14 engineers; the **Skill** is the rating of that capability. Two views, one area."
>
> **Dev:** "A **Post** about my work on a **Project** — should it link to that Project?"
> **Owner:** "No. A **Post** is standalone. It might mention a Project in prose, but the model doesn't connect them. And if a Post exists, it's published — I don't keep drafts in there."

## Configuration

- `SITE_URL` — required build-time env var (see `src/data/siteConfig.ts`) used to build absolute URLs for the RSS feed (`src/app/feed.xml/route.ts`) and Next.js `metadataBase`. Missing it fails the build fast.

## Flagged ambiguities

- "Leadership" was used for both an Achievement group and a Skill category — resolved: both reference the same **Domain Area**; **Achievement** (evidence) and **Skill** (rating) are distinct views of it.
- "Project" implied shipped-only — resolved: spans the full lifecycle; maturity lives in **MVP Progress**.
- `ServiceCard`/`serviceTitle` named a non-concept ("Service") while rendering live — resolved: the card is a **Domain Area**'s headline (its offering). Renamed to `AreaHeadlineCard` / `DomainArea.headline`; "Service" is gone from the code.
- README described an MDX/Velite blog model that did not exist in code — actual content was static data modules. Glossary followed the code, not the README. _Update 2026-06-09: the **Blog** is now being built for real as an MDX feature (see [ADR-0001](docs/adr/0001-mdx-for-blog-posts.md)); the model is **Post** + **Blog** as defined above. The stale-README note is resolved by building the thing, not deleting the claim._
