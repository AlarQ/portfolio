---
id: "007"
name: "Follow-up for FR-5: Add e2e assertions for reduced-motion-swap (page.emulateMedia reducedMotion:reduce -> swap wrapper has no active transition/duration) and zoom-200-tablist (tablist stays one row, all tabs keyboard-reachable while overflowing)."
status: implemented
blocked_by: []
max_files: 5
estimated_files: []
test_cases: []
ground_rules:
  - frontend/accessibility.md
  - frontend/components.md
  - frontend/design-tokens.md
  - frontend/styling.md
  - languages/nextjs/app-router.md
  - languages/nextjs/server-vs-client.md
  - languages/typescript/patterns.md
  - languages/typescript/type-safety.md
  - security/authz.md
  - security/input-validation.md
  - testing/structure.md
  - testing/test-quality.md
pr_url: https://github.com/AlarQ/portfolio/pull/85
---

## Description

Auto-created follow-up for **FR-5** from spec audit (verdict=reopen).

Original FR finding: Add e2e assertions for reduced-motion-swap (page.emulateMedia reducedMotion:reduce -> swap wrapper has no active transition/duration) and zoom-200-tablist (tablist stays one row, all tabs keyboard-reachable while overflowing).

## Implementation notes

chunks_spawned: 1 (inline path, generalist)

- Added two tests to `e2e/projects-index.spec.ts`:
  - `summary swap has no active transition under prefers-reduced-motion: reduce` — sets `page.emulateMedia({ reducedMotion: "reduce" })`, swaps the pill, and asserts `getComputedStyle(swapEl).transitionDuration` is all-zero via the existing `data-testid="project-summary-swap"` hook (already wired to `motion-reduce:transition-none` in `pages/Projects.tsx`). No production code change needed — the FR-5 behavior was already implemented; this task closes the assertion gap flagged by spec audit.
  - `tablist stays one row and every tab stays reachable at 200% zoom` — approximates 200% zoom via a halved (600px) viewport, asserts computed `flex-wrap: nowrap` on the `tablist`, that every tab stays reachable via `scrollIntoViewIfNeeded` + visibility, and that Home/End roving-tabIndex keyboard nav still reaches the first/last tab while the strip overflows.
  - Both new tests follow the existing file's `test.skip(projects.length < 2, ...)` guard for the swap-dependent one, consistent with the pre-existing pill-swap test — currently skipped (only one Project in `src/data/projects.ts`), matching existing suite behavior; the zoom test needs no such guard and runs unconditionally.
- No source/component changes — behavior was already correct, only test coverage was added.
