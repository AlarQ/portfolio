---
id: "006"
name: "Follow-up for FR-3: Extend projectPresentation to accept mvpProgress (or add pure isLowMvpProgress helper with agreed threshold) so a non-exploring Project with low mvpProgress also resolves to tone muted; add unit test (status:in-progress, mvpProgress:5 -> muted) + Storybook state."
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
---

## Description

Auto-created follow-up for **FR-3** from spec audit (verdict=reopen).

Original FR finding: Extend projectPresentation to accept mvpProgress (or add pure isLowMvpProgress helper with agreed threshold) so a non-exploring Project with low mvpProgress also resolves to tone muted; add unit test (status:in-progress, mvpProgress:5 -> muted) + Storybook state.

## Implementation Notes

- Added a pure `isLowMvpProgress(mvpProgress: number): boolean` helper in `src/utils/projectPresentation.tsx`, threshold `LOW_MVP_PROGRESS_THRESHOLD = 10` (agreed threshold: task's example `mvpProgress: 5` must be muted; the meaningful gap before "low" is single digits, so 10 was chosen as the smallest round threshold that satisfies it without being arbitrary noise like 7 or 12).
- `projectPresentation(status, mvpProgress?)` — `mvpProgress` is optional (backward-compatible signature); when provided and `isLowMvpProgress` is true, both `tone` and `dot` resolve to `muted` regardless of `status`.
- Updated both call sites (`ProjectSummary.tsx`, `ProjectTabStrip.tsx`) to pass `project.mvpProgress`.
- Unit tests added: `status:in-progress, mvpProgress:5 -> muted` (RED confirmed before the fix, GREEN after) and a control case (`mvpProgress:80 -> info`) to guard against over-muting.
- Storybook: added `LowMvpProgress` state to `ProjectSummary.stories.tsx` mirroring the unit test's scenario.
- No refactor pass needed — the change is a single optional parameter + one pure predicate; no duplication introduced.

## Post-Implementation Quality Check

Two advisory agents (`code-quality-pragmatist`, `engineering-frontend-developer`) reviewed the diff — no high/critical findings. Addressed:
- Added `ProjectTabStrip.stories.tsx` → `LowMvpProgress` state (medium finding: the second seam consumer's story coverage was missing the muted-dot-on-non-exploring-status branch).
- Added a boundary unit test (`mvpProgress: 10` → not muted, locks in `<` not `<=` semantics).
- Clarified JSDoc: `label` always reflects Status text; only `tone`/`dot` are muted by low `mvpProgress`.

Final gates: type-check clean, lint clean, lint:stories clean, full unit suite 303 passed / 1 skipped.
