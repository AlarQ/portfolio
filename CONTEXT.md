# Portfolio

Personal portfolio site presenting the owner's work, expertise, and current focus. Content is curated and self-authored; there is no external audience input or persistence.

## Language

**Project**:
A piece of work the owner built or is building, at any point in its lifecycle (shipped or in progress); maturity is tracked as MVP Progress.
_Avoid_: Showcase, demo, portfolio piece

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
A single published piece of writing on the **Blog**, authored as MDX. Standalone — it carries no link to a **Project**, **Domain Area**, or **Topic**. Published-only: a Post that exists is live (presence in `content/posts/` = published); there is no draft state in the model.
_Avoid_: Article, entry, blog post, writing

**Blog**:
The collection of **Posts** and the section of the site that lists and renders them. The container; a **Post** is one item in it.
_Avoid_: Journal, news, articles section

## Relationships

- A **Project** has exactly one **MVP Progress**
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

## Flagged ambiguities

- "Leadership" was used for both an Achievement group and a Skill category — resolved: both reference the same **Domain Area**; **Achievement** (evidence) and **Skill** (rating) are distinct views of it.
- "Project" implied shipped-only — resolved: spans the full lifecycle; maturity lives in **MVP Progress**.
- `ServiceCard`/`serviceTitle` named a non-concept ("Service") while rendering live — resolved: the card is a **Domain Area**'s headline (its offering). Renamed to `AreaHeadlineCard` / `DomainArea.headline`; "Service" is gone from the code.
- README described an MDX/Velite blog model that did not exist in code — actual content was static data modules. Glossary followed the code, not the README. _Update 2026-06-09: the **Blog** is now being built for real as an MDX feature (see [ADR-0001](docs/adr/0001-mdx-for-blog-posts.md)); the model is **Post** + **Blog** as defined above. The stale-README note is resolved by building the thing, not deleting the claim._
