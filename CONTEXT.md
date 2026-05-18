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

## Relationships

- A **Project** has exactly one **MVP Progress**
- A **Domain Area** is evidenced by zero or more **Achievements** and rated by zero or more **Skills**
- An **Achievement** and a **Skill** describe the same **Domain Area** from different angles (did vs. can)
- There is exactly one current **Topic** and zero or more current **Reading** items

## Example dialogue

> **Dev:** "Should a finished book move into a 'past reading' list?"
> **Owner:** "No — **Reading** is only what I'm reading now. A finished book just leaves; we don't track history."
>
> **Dev:** "Leadership shows up as both an **Achievement** group and a **Skill** category. Same thing?"
> **Owner:** "Same **Domain Area**. The **Achievement** is proof I led 14 engineers; the **Skill** is the rating of that capability. Two views, one area."

## Flagged ambiguities

- "Leadership" was used for both an Achievement group and a Skill category — resolved: both reference the same **Domain Area**; **Achievement** (evidence) and **Skill** (rating) are distinct views of it.
- "Project" implied shipped-only — resolved: spans the full lifecycle; maturity lives in **MVP Progress**.
- `ServiceCard` component exists but has no live usage — resolved: "Service" is **not** a domain concept; component is dead code, omitted from glossary.
- README describes an MDX/Velite blog model that does not exist in code — actual content is static data modules. Glossary follows the code, not the README.
