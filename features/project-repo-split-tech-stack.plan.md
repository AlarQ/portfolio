# Implementation Plan — Repo-split tech stack on the Project summary

**Status:** ready to implement · **Author of decision:** owner (2026-07-14) ·
**Runs standalone in a fresh session — this file is the complete brief.**

---

## 0. What & why (read first)

The `/projects` summary card today renders a **flat** badge row of every
technology in a Project. A Project can span several repos (e.g. a Next.js
frontend + a Rust backend), and that structure is invisible.

A throwaway UI prototype (`src/app/projects/tech-split-prototype/`, dev-only
route) offered three layouts. The owner picked **Variant A — "Stacked labeled
rows"**: each repo is one row — a role label (`Frontend` / `Backend`) in a
fixed left gutter, its tech badges to the right. See that folder's `NOTES.md`
and `variants.tsx` (`VariantA`) for the exact visual.

**This plan folds Variant A into production code and deletes the prototype.**
It rewrites `Project` code that was written under prototype constraints (no
tests, no seam discipline) into real, rule-compliant code — do **not** copy the
prototype files into `src/`.

### Baked-in design decisions (flagged so a reviewer can flip them)

1. **Replace `techStack`, don't add alongside.** `Project.techStack:
   readonly TechKey[]` is **replaced** by `Project.repos: readonly
   ProjectRepo[]`. Keeping both would be two sources of truth for one tech list
   — a DRY/parallel-array violation the repo explicitly forbids. The flat list
   is derivable from `repos` and is needed nowhere else (only `ProjectSummary`
   ever read it — verified by grep).
2. **Role label shows only when `repos.length > 1`.** Single-repo Projects
   (Hyperion, Bondsmith) render a plain badge row exactly like today — the
   split only appears where it adds meaning. This is a **presentation** rule
   and lives in the component, not the data.
3. **No fabricated repo names.** The prototype showed `/web`, `/api` etc. —
   those were placeholders. The validated thing is the *split*, not the names.
   `ProjectRepo` has **no `name` field** (YAGNI; a pragmatist would flag a
   speculative unused field). Add it later if the owner wants real repo names.
4. **Role vocabulary is a closed union `"frontend" | "backend"`.** No
   `"fullstack"` — every current repo is one or the other. The human labels
   `Frontend`/`Backend` are **presentation**, resolved in the seam via an
   exhaustive `Record<RepoRole, string>` (missing entry = compile error),
   never stored in `src/data/`.

---

## 1. Repo rules this change MUST honor

Pulled from `CLAUDE.md` + `CONTEXT.md`. The reviewing agents (§6) check against these.

- **Seam pattern.** `src/data/*` carries types + data only — **no JSX, no
  color literals, no icons, no human-facing labels that are presentation.**
  Any `RepoRole → label` resolution lives in `src/utils/projectPresentation.tsx`
  (the presentation seam). Components consume seam output; they never resolve
  labels/colors themselves.
- **Exhaustive `Record` maps.** New role→label map uses `Record<RepoRole,
  string>` (mirrors `STATUS_PRESENTATION`, `TECH_HUES`) so an unmapped role is
  a TS compile error, not a runtime gap.
- **Design tokens only.** Component uses semantic Tailwind utilities
  (`text-muted-foreground`, `gap-*`, `rounded-lg`, …). **No hex/rgb/oklch, no
  `bg-[#…]` arbitrary colors, no `primitives` import.** (`grit` lint enforces.)
  Non-color arbitrary values like `w-24` are fine. Variant A already complies.
- **Storybook-first / story-is-contract.** `ProjectSummary` already has a
  story. Changing its rendering/visual states **updates
  `ProjectSummary.stories.tsx` in the same commit**, covering: multi-repo
  split, single-repo (no label), empty repos, long tech list, light + dark.
  Verify in Storybook before considering it done. `npm run lint:stories`
  (pre-commit) must stay green.
- **CONTEXT.md is the glossary.** Introduce the **Repo** term precisely and
  disambiguate it from the existing "no external repo links" rule. Update the
  **Project summary** entry (it currently lists "Tech stack" as a flat field).
- **Type strictness / Biome.** `noExplicitAny`, `noUnusedVariables/Imports` are
  errors. Run `npm run type-check` (Biome does NOT type-check).
- **Conventional Commits** via Husky/commitlint.

---

## 2. Files to change (complete list — grep-verified)

Core:
- `src/data/projects.ts` — type + all 5 data entries.
- `src/utils/projectPresentation.tsx` — add role→label seam.
- `src/components/ds/ProjectSummary.tsx` — render grouped rows.
- `src/components/ds/ProjectSummary.stories.tsx` — new states.
- `CONTEXT.md` — glossary.

Tests / fixtures referencing `techStack` (each becomes `repos`):
- `src/components/ds/ProjectSummary.test.tsx`
- `src/components/ds/ProjectTabStrip.test.tsx`
- `src/components/ds/ProjectTabStrip.stories.tsx`
- `src/components/pages/Projects.stories.tsx`
- `src/components/pages/Projects.test.tsx`
- `src/data/projects.test.ts` (asserts `Array.isArray(entry.techStack)`)
- `src/data/slug.test.ts`
- `src/data/projectLoader.test.ts`

Docs / cleanup:
- `docs/adr/0002-mdx-project-briefs.md` — prose mentions `techStack`; update to `repos`.
- **Delete** `src/app/projects/tech-split-prototype/` (whole folder).

Type-tests to sanity-check (no `techStack` refs, but confirm still green):
`src/data/projects.typetest.ts`, `src/utils/projectPresentation.typetest.ts`.

---

## 3. Step-by-step

Do these in order — data → seam → component → story → tests → data migration →
docs → prototype deletion. Verify after each cluster.

### 3.1 Domain type — `src/data/projects.ts`

Add above `interface Project` (keep `TechKey` union unchanged):

```ts
/** A source repository comprising a Project, carrying a role and its own
 *  subset of the Tech stack. The role's human label (Frontend/Backend) is
 *  presentation and lives in `projectPresentation.tsx`, not here. */
export type RepoRole = "frontend" | "backend";

export interface ProjectRepo {
  readonly role: RepoRole;
  readonly techKeys: readonly TechKey[];
}
```

In `interface Project`, replace:
```ts
  readonly techStack: readonly TechKey[];
```
with:
```ts
  readonly repos: readonly ProjectRepo[];
```

### 3.2 Presentation seam — `src/utils/projectPresentation.tsx`

Add (import `RepoRole` alongside the existing `Status, TechKey` import):

```ts
/** Closed RepoRole → display label map — the role analogue of TECH_HUES.
 *  Exhaustive: a RepoRole without a label here is a compile error. */
const REPO_ROLE_LABELS: Record<RepoRole, string> = {
  frontend: "Frontend",
  backend: "Backend",
};

/** Resolve a ProjectRepo `RepoRole` to its display label. */
export function repoRolePresentation(role: RepoRole): string {
  return REPO_ROLE_LABELS[role];
}
```

Optionally extend `projectPresentation.typetest.ts` with a
`// @ts-expect-error` line proving `repoRolePresentation("mobile")` is rejected
(mirrors the existing `techPresentation("vue")` guard).

### 3.3 Component — `src/components/ds/ProjectSummary.tsx`

Import `repoRolePresentation` from the seam. Replace the current tech block
(the `project.techStack.length > 0 && (...)` JSX) with grouped rows. Behavior:
`repos.length > 1` → show the role-label gutter; otherwise render badges as a
plain row (decision #2). Badge hues still via `techPresentation`.

```tsx
{project.repos.length > 0 && (
  <div className="flex flex-col gap-3">
    {project.repos.map((repo) => (
      <div
        key={repo.role}
        className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
      >
        {project.repos.length > 1 && (
          <span className="w-24 shrink-0 pt-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {repoRolePresentation(repo.role)}
          </span>
        )}
        <div className="flex flex-wrap gap-2">
          {repo.techKeys.map((techKey) => (
            <Badge key={techKey} category={techPresentation(techKey)}>
              {techKey}
            </Badge>
          ))}
        </div>
      </div>
    ))}
  </div>
)}
```

Update the component's JSDoc to say tech is grouped per Repo via
`repoRolePresentation` + `techPresentation`. (`key={repo.role}` is safe — roles
are unique per Project in the data; if that ever changes, key on index.)

### 3.4 Story — `src/components/ds/ProjectSummary.stories.tsx`

Update the fixture(s) from `techStack: [...]` to `repos: [...]`. Cover these
stories (both themes via the toolbar): **Multi-repo** (frontend + backend, the
headline case), **Single-repo** (one repo → no gutter label), **Empty**
(`repos: []` → no tech block), **Long stack** (a repo with many techs → wrap).
Verify in Storybook (`npm run storybook`, port 6006), check a11y panel + light
and dark.

### 3.5 Tests + remaining fixtures

For every file in §2's test list, replace `techStack: [...]` with an equivalent
`repos: [...]`. Empty `techStack: []` → `repos: []`. A flat list like
`techStack: ["nextjs","react"]` with no split intent → `repos: [{ role:
"frontend", techKeys: ["nextjs","react"] }]`.

- `src/data/projects.test.ts` line ~22: replace the `Array.isArray(
  entry.techStack)` assertion with: `repos` is an array, and every repo has a
  `role` and an array `techKeys`. Consider adding an assertion that each
  `repo.role` is one of `"frontend" | "backend"`.
- `ProjectSummary.test.tsx`: add/adjust a case asserting the role label
  **renders** for a 2-repo Project and is **absent** for a 1-repo Project.

### 3.6 Data migration — the 5 real Projects

Rewrite each `techStack` in `projects` (owner-validated partition from the
prototype; membership is preserved 1:1 with today's flat lists):

| slug | repos |
|------|-------|
| `job-offer-box` | frontend `[nextjs, react, typescript, playwright]`, backend `[rust, postgres]` |
| `hyperion` | backend `[rust, axum, postgres]` |
| `gtd-app` | frontend `[nextjs, react, typescript, tailwind, shadcn]`, backend `[rust]` |
| `bondsmith` | backend `[rust]` |
| `potrzebnik` | frontend `[nextjs, react, typescript, tailwind, shadcn]`, backend `[postgres]` |

e.g.:
```ts
repos: [
  { role: "frontend", techKeys: ["nextjs", "react", "typescript", "playwright"] },
  { role: "backend", techKeys: ["rust", "postgres"] },
],
```

### 3.7 Glossary — `CONTEXT.md`

- Add a **Repo** term (place near Project summary): _"A source repository
  comprising a **Project**, carrying a role (**Frontend**/**Backend**) and its
  own subset of the **Tech stack**. Structural grouping only — it does **not**
  introduce an external link (the 'Projects link only to on-site content' rule
  still holds); the split is shown as grouped tech badges, not a GitHub URL. A
  Project has one or more Repos; single-Repo Projects render an unlabeled
  badge row."_ Add a rejected-synonym note distinguishing this internal **Repo**
  from the forbidden **external repo link**.
- Update the **Project summary** entry: its tech is now grouped **per Repo**,
  not a single flat "Tech stack" row.
- If the invariants list (near line 53) enumerates Project relations, add
  "A **Project** has one or more **Repos**."

### 3.8 ADR prose — `docs/adr/0002-mdx-project-briefs.md`

Change the `techStack` mention in the rejected-option prose to `repos` so the
example field list matches the type. (No new ADR needed — this is a field
reshape within the existing seam decision, not a new architectural direction.
If the reviewer disagrees, a short ADR-0003 "Project repos" is acceptable.)

### 3.9 Delete the prototype

```bash
rm -rf src/app/projects/tech-split-prototype
```
Confirm nothing else imports it: `grep -rn "tech-split-prototype" src` → empty.

---

## 4. Validation gates (all must pass)

```bash
npm run type-check      # tsc --noEmit — Biome does NOT type-check
npm run lint            # biome + grit palette guard
npm run lint:stories    # every storied component has its story
npm run test:unit       # vitest run
npx playwright test --project=chromium   # chromium is the reliable signal
npm run storybook       # manual: multi/single/empty stories, light + dark, a11y panel
```
(webkit/mobile e2e have known pre-existing failures — chromium is the gate.)

Fix everything red before §5. Re-run the full block after any fix.

---

## 5. Commit (only after §4 green)

Conventional Commit, e.g.:
```
feat(projects): group Project tech stack per repo on the summary card

Replace flat Project.techStack with repos: ProjectRepo[] (role + techKeys).
ProjectSummary renders one labeled row per repo (Frontend/Backend), label
shown only when a Project spans 2+ repos. Role labels resolved in the
projectPresentation seam. Removes the tech-split-prototype route.
```
End the commit body with the Co-Authored-By trailer this environment requires.
If on `main`, branch first. Do **not** push unless the owner asks.

---

## 6. Agent review phase (required)

After §4 is green and changes are committed (or staged), run **three review
agents in parallel** — send all three `Agent` tool calls in a single message so
they run concurrently. Give each the branch diff (`git diff main...HEAD` or the
staged diff) plus this plan for spec-alignment.

1. **Code Reviewer** (`subagent_type: "Code Reviewer"`) — correctness,
   maintainability, security, perf on the diff. Watch for: seam leaks (labels
   in data), token violations, missing story states, key/render bugs.
2. **odium** (`subagent_type: "odium"`) — claim-vs-reality audit: does the
   implementation actually match THIS plan? Every `techStack` reference
   migrated? Prototype fully deleted? Glossary + ADR updated? No half-done
   step marked done. No scope creep beyond the plan.
3. **code-quality-pragmatist** (`subagent_type: "code-quality-pragmatist"`) —
   over-engineering / unnecessary complexity. Sanity-check decisions #1–#4
   (esp. that no speculative `name`/`fullstack`/derived-flat-list machinery
   crept in).

Suggested prompt skeleton for each (adapt per agent):
> Review the changes on this branch against the plan at
> `features/project-repo-split-tech-stack.plan.md`. The repo rules are in
> `CLAUDE.md` and `CONTEXT.md`. Scope: the diff vs `main`. Report findings by
> severity with file:line; do not fix.

**Triage:** collect findings, fix every confirmed issue, re-run §4 gates, and
briefly note any finding deliberately dismissed (with the reason). Amend the
commit or add a follow-up commit. The change is done when all three agents
return clean (or only knowingly-dismissed notes remain) and §4 is green.

---

## 7. Rollback / notes

- Pure additive-then-swap; revert = `git revert`/reset the branch. No data
  migration outside source files, no external state.
- If the owner later wants concrete repo names shown (the prototype's `/web`,
  `/api`): add optional `name?: string` to `ProjectRepo` and render it after
  the role label in `ProjectSummary` — deferred here on purpose (decision #3).
