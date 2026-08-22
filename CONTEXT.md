# Portfolio

Personal portfolio site presenting the owner's work, expertise, and current focus. Content is curated and self-authored; there is no external audience input or persistence.

## Language

**Project**:
A piece of work the owner built or is building, at any point in its lifecycle (shipped or in progress); maturity is tracked by its **Roadmap**. Presented to readers via its own **Project Brief**, and references zero or more related **Posts** (technical deep-dives), surfaced on the Project's card as labeled links. Projects link only to on-site content - no external repo/demo/GitHub Pages links.
_Avoid_: Showcase, demo, portfolio piece

**Project Brief**:
The owner-authored, on-site description page for a single **Project** - public-facing documentation of what the Project is, rendered from MDX at `/projects/[slug]`. Distinct from a **Post**: a Brief documents a Project; a Post is standalone blog writing. Each Project has exactly one Brief. The Brief's long-form body lives in `content/projects/[slug].mdx`; its structured fields live in `src/data/projects/` (see [ADR-0002](docs/adr/0002-mdx-project-briefs.md)). Distinct from the **Project summary** below - the Brief is the deep page, the summary is the card.
_Avoid_: Article, post, readme, showcase, case study

**Project summary**:
The compact card view of a **Project** shown as one `ds/ProjectCard` per Project on the `/projects` index: title, tagline, tech grouped per **Repo**, a light inline **Milestone Progress** figure (`NN% to <Milestone>`, or a state word once the Milestone is reached), and a link to the Project's detail route `/projects/[slug]`. Rendered from the typed fields in `src/data/projects/` - it carries no long-form prose and no MDX, no meter bar, no poster thumbnail (those live only on the detail route's header). Not a synonym for Brief - the summary is the index card, the Brief is the page, and the summary links to the Project's detail route, not directly to the Brief.
_Avoid_: Brief, card, tile, preview

**Capability**:
A user-facing claim about what a **Project** lets you do - 2-3 sentences, true on its own, optionally evidenced by one **media item** (a silent clip with a `label`/`description`, or a still with an `alt`). Rendered by `ds/CapabilitiesSection` on the Project's detail route, above the **Roadmap**: media-bearing Capabilities alternate sides at `md:`, caption always before frame in DOM order; a Capability without media renders as a compact full-width one-liner. Not authored per **Feature** or per **Milestone** - a Capability can be true regardless of Roadmap progress.
_Avoid_: Caption, feature, benefit, use case

**Repo**:
A source repository comprising a **Project**, carrying a role (**Frontend**/**Backend**) and its own subset of the **Tech stack**. A Project has one or more Repos; single-Repo Projects render an unlabeled badge row, multi-Repo Projects show a role-labeled row per Repo. Structural grouping only - it does **not** introduce an external link (the "Projects link only to on-site content" rule still holds); the split is shown as grouped tech badges, never a GitHub URL. Not to be confused with the forbidden external repo link mentioned under **Project**.
_Avoid_: Repository link, GitHub link, source link

**Roadmap**:
The forward-looking view of a single **Project**: exactly one named **Milestone** and an ordered list of **Features**. Every Project has exactly one Roadmap. Replaces the authored MVP-percentage model entirely - the Roadmap is the maturity story, and **Milestone Progress** is derived from it rather than typed by hand.
_Avoid_: Timeline, plan, backlog, board

**Milestone**:
The single named threshold a **Project** is working toward, and the only thing the Roadmap's divider marks. Its name is authored per Project - Bondsmith's is "MVP", Hyperion's is "Maturity" - so no Project is a special case and the word "MVP" is never hardcoded in the model. A Roadmap has exactly one Milestone. Not a unit of work: the units are **Features**, and a Milestone is the line they are measured against.
_Avoid_: Goal, target, release, phase, epic

**Feature**:
One unit of work on a **Project**'s **Roadmap** - a "bigger feature", not a task. Carries a **status** (`shipped` / `in-progress` / `planned`; several may be `in-progress` at once - there is no single "current focus") and a **phase** (`toward` the Milestone, or `beyond` it). Both vocabularies are closed sets, resolved to labels and hues in the presentation seam via exhaustive `Record`s. `phase` states meaning, not screen position - the divider's left/right rendering is presentation and must not leak into `src/data/`. Distinct from the PRD documents under `features/`, which are authoring artifacts, not domain objects; and distinct from an **Achievement**, which is about the owner across **Domain Areas** rather than about one Project.
_Avoid_: Task, ticket, item, story, milestone

**Milestone Progress**:
How close a **Project** is to its **Milestone**, **derived** and never authored: shipped `toward` **Features** divided by total `toward` Features. `beyond` Features are excluded from both sides, so the figure reaches 100% exactly when the Milestone is met, and shipping a `beyond` Feature never moves it. Rendered under the Milestone's own name ("MVP progress", "Maturity progress"), and it stays visible at 100% once the Milestone is met. Supersedes the former hand-set **MVP Progress** percentage, which could drift from reality; this cannot.
_Avoid_: MVP Progress, completion, status, done, percent complete

**Domain Area**:
A field of expertise the owner works in (e.g. Leadership, Backend). Evidenced by **Achievements** and rated by **Skills** - the two are different views of the same area.
_Avoid_: Discipline, category, specialty

**Achievement**:
A concrete thing the owner did or delivered within a **Domain Area** - past, outcome-oriented.
_Avoid_: Accomplishment, highlight, win

**Skill**:
A durable capability the owner holds within a **Domain Area**, carrying a level and optional years of experience - present, rated.
_Avoid_: Competency, ability, expertise

**Reading**:
A book the owner is reading right now. Scoped to active reading only - finished or queued books are not modeled.
_Avoid_: Bookshelf, library, reading list, book tracker

**Topic**:
The owner's single current learning/exploration focus. Singular by design - exactly one at a time.
_Avoid_: Interests, subjects, focus areas

**Post**:
A single published piece of writing on the **Blog**, authored as MDX. Self-contained - a Post references nothing itself, though a **Project** may reference Posts as its related deep-dives (the link points Project→Post, never the reverse). Published by default: a Post that exists is live unless its frontmatter sets `draft: true`. A `draft: true` Post is owner-authored, visible only in the dev environment (`pnpm dev`), and excluded from production builds, static params, and the RSS feed - its `/blog/[slug]` URL 404s in prod.
_Avoid_: Article, entry, blog post, writing

**Blog**:
The collection of **Posts** and the section of the site that lists and renders them. The container; a **Post** is one item in it.
_Avoid_: Journal, news, articles section

## Relationships

- A **Project** has exactly one **Roadmap**, exactly one **Project Brief**, and references zero or more related **Posts**
- A **Project** has zero or more **Capabilities**; a **Capability** has at most one media item
- A **Roadmap** has exactly one **Milestone** and zero or more **Features**; a **Feature** belongs to exactly one Roadmap
- **Milestone Progress** is derived from a **Roadmap**'s `toward` **Features** - it is stored nowhere
- A **Domain Area** is evidenced by zero or more **Achievements** and rated by zero or more **Skills**
- An **Achievement** and a **Skill** describe the same **Domain Area** from different angles (did vs. can)
- There is exactly one current **Topic** and zero or more current **Reading** items
- A **Blog** contains zero or more **Posts**; a **Post** belongs to exactly one **Blog** and references no other concept

## Example dialogue

> **Dev:** "Should a finished book move into a 'past reading' list?"
> **Owner:** "No - **Reading** is only what I'm reading now. A finished book just leaves; we don't track history."
>
> **Dev:** "Leadership shows up as both an **Achievement** group and a **Skill** category. Same thing?"
> **Owner:** "Same **Domain Area**. The **Achievement** is proof I led 14 engineers; the **Skill** is the rating of that capability. Two views, one area."
>
> **Dev:** "A **Post** about my work on a **Project** - should it link to that Project?"
> **Owner:** "No. A **Post** is standalone. It might mention a Project in prose, but the model doesn't connect them. And a Post is published once it exists, unless I mark it `draft: true` to keep iterating on it locally - drafts never reach production."

## Configuration

- `SITE_URL` - required build-time env var (see `src/data/siteConfig.ts`) used to build absolute URLs for the RSS feed (`src/app/feed.xml/route.ts`) and Next.js `metadataBase`. Missing it fails the build fast.

## Flagged ambiguities

- "Leadership" was used for both an Achievement group and a Skill category - resolved: both reference the same **Domain Area**; **Achievement** (evidence) and **Skill** (rating) are distinct views of it.
- "Project" implied shipped-only - resolved: spans the full lifecycle; maturity lives in the **Roadmap**.
- "MVP" was being modelled as a property of every Project, but Hyperion was already past any MVP - resolved: the line is universal and its *name* is per-Project (**Milestone**), so no Project is a special case. See [#98](https://github.com/AlarQ/portfolio/issues/98).
- "Milestone" and "Feature" were used interchangeably for the roadmap unit - resolved: **Milestone** is the single named line; **Features** are the many units measured against it. "Milestone" was rejected as the unit name because it implies one focus at a time, and several **Features** can be `in-progress` at once.
- `ServiceCard`/`serviceTitle` named a non-concept ("Service") while rendering live - resolved: the card is a **Domain Area**'s headline (its offering). Renamed to `AreaHeadlineCard` / `DomainArea.headline`; "Service" is gone from the code.
- README described an MDX/Velite blog model that did not exist in code - actual content was static data modules. Glossary followed the code, not the README. _Update 2026-06-09: the **Blog** is now being built for real as an MDX feature (see [ADR-0001](docs/adr/0001-mdx-for-blog-posts.md)); the model is **Post** + **Blog** as defined above. The stale-README note is resolved by building the thing, not deleting the claim._
