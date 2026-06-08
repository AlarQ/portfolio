# Findings: `portfolio`

**Date**: 2026-06-08
**Scope**: `src/utils/*Presentation.*`

---

## [test-coverage] Presentation seams carry untested business rules — the interface is the test surface — RESOLVED (2026-06-08, #26)

**Severity**: Medium

**Files**:
- `src/utils/projectPresentation.ts:17-21` (`mvpProgressTone` thresholds)
- `src/utils/skillPresentation.tsx:57-73` (`CATEGORY_COLORS` map + `categoryColor`)
- `src/utils/readingPresentation.ts:11-21` (`CATEGORY_COLORS` map + `readingCategoryColor`)
- only e2e tests exist (`e2e/`); no unit tests for these pure modules

**Problem**:
The presentation seams are the deepest, purest, most testable modules in the repo — data in, tone/color out, no DOM — yet they have zero unit tests. The only automated coverage is Playwright e2e, which exercises them indirectly and is the known-flaky surface (webkit/mobile failures).

`mvpProgressTone` encodes a real **MVP Progress** business rule with magic thresholds and no regression guard:

```ts
// projectPresentation.ts:17-21
export function mvpProgressTone(progress: number): MvpProgressTone {
  if (progress >= 80) return "success";
  if (progress >= 50) return "primary";
  return "secondary";
}
```

A change to "≥ 75 → success" would pass silently. Boundary values (0, 49, 50, 79, 80, 100) are exactly what a unit test should pin.

The category-color `Record`s give compile-time safety on *missing* keys (a new `SkillCategory` without an entry is a compile error), but nothing verifies the *mapping itself* — that `Leadership` resolves to the intended brand token rather than the wrong one.

**Fix**:
Add unit tests at the seam interfaces — no structural change, pure deepening of trust. Cover `mvpProgressTone` boundaries (0/49/50/79/80/100 → expected tone), and `categoryColor` / `readingCategoryColor` mapping (each category → expected `brand` token). This is the cheapest, highest-leverage coverage available and locks the seam contracts. (Note: the repo has no unit-test runner configured yet — adding one, e.g. Vitest, is a prerequisite.)

---
