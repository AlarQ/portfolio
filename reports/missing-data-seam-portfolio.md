# Findings: `portfolio`

**Date**: 2026-06-08
**Scope**: `src/app/page.tsx`, `src/components/TopicSection.tsx`, `src/components/HeroContent.tsx`, `src/data/`

---

## [missing-data-seam] Topic concept has no data module — smeared across page prop and component JSX

**Severity**: Medium

**Files**:
- `src/app/page.tsx:30`
- `src/components/TopicSection.tsx:11` (the `topic?` prop)
- `src/components/TopicSection.tsx:80-82` (prop only overrides the bold heading line)
- `src/components/TopicSection.tsx:84-111` (real prose + GitHub URL hardcoded as JSX)
- no `src/data/topic.ts` exists

**Problem**:
`CONTEXT.md` defines **Topic** as a first-class domain concept ("the owner's single current learning/exploration focus. Singular by design — exactly one at a time"). Every other domain concept (Project, Skill, Reading, Domain Area) has a typed home in `src/data/`. Topic does not.

The content is split two ways. `page.tsx:30` passes a `topic` string, but that prop only sets the bold heading (`TopicSection.tsx:80`). The substantive content — the descriptive paragraph, the OpenAgentsControl GitHub link, and the italic fallback text — is hardcoded JSX inside `TopicSection` (`:84-111`). The prop value and the hardcoded prose currently describe the same project in two different wordings, so they are already drifting.

```tsx
// page.tsx:30 — one phrasing
<TopicSection topic="Exploring OpenAgentsControl: AI Agent Framework for Approval-Based Development Workflows." />

// TopicSection.tsx:92-110 — a different phrasing of the same thing, hardcoded
Currently exploring <Link href="https://github.com/darrenhinde/OpenAgentsControl">…</Link> framework, an AI agent system for plan-first development workflows…
```

To change "what I'm digging into" you must edit two files and reconcile two copies. No test can reach the prose buried in JSX.

**Fix**:
Create `src/data/topic.ts` exporting a typed Topic (`title`, `description`, `link: { label, href }`, optional fallback). `TopicSection` consumes the single Topic value and renders it; `page.tsx` stops passing prose. This gives Topic a data home consistent with its sibling concepts and makes the value testable. Keep any icon/color resolution in a presentation seam per the established layering.

---

## [missing-data-seam] Owner identity and Stats hardcoded in page.tsx instead of a data module

**Severity**: Low

**Files**:
- `src/app/page.tsx:12-20` (`title`, `subtitle`, `stats` array literal)
- `src/components/HeroContent.tsx:7` (by contrast, fetches `domainAreas` from `@/data/domains` itself)

**Problem**:
`page.tsx` acts as a data source: the owner's role strings (`"SOFTWARE ENGINEER"`, `"TEAM LEADER"`) and the Stats array (`{ value, label }` triples) are inline literals with no type and no module.

```tsx
// page.tsx:16-20 — content as a literal, no shape, no data home
stats={[
  { value: "6+", label: "Years of Experience" },
  { value: "14", label: "Engineers Led" },
  { value: "3+", label: "Years Leading Teams" },
]}
```

This is also inconsistent with the data-flow direction elsewhere: `HeroContent` reaches into `@/data/domains` for its Domain Areas (`HeroContent.tsx:7`), but receives Stats as props from the page. Two directions in one component makes it unclear where a new piece of self-description (e.g. another stat) should live — alongside the literal in `page.tsx`, or fetched like `domainAreas`. There is no single place to see "what I say about myself."

**Fix**:
Move owner identity (title/subtitle) and Stats into `src/data/` as typed values (e.g. `src/data/profile.ts`). `HeroContent` consumes them the same way it consumes `domainAreas`, so all hero content flows one direction. `page.tsx` returns to orchestrating layout only. Note: Stats is not in `CONTEXT.md`'s glossary — if it becomes a typed concept, decide whether it warrants a glossary entry or stays an implementation detail of the profile.

---
