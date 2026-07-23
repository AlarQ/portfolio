import { techPresentation } from "./projectPresentation";

/**
 * Type-only fixture (never imported at runtime) proving the
 * `TechKey → BadgeCategory` map in `projectPresentation.tsx` is a closed
 * compile-time contract, not a runtime fallback - the Project analogue of
 * `categoryPresentation.typetest.tsx`. Checked via the whole-project
 * `npx tsc --noEmit` that `projectPresentation.typetest.test.ts` runs.
 */
// @ts-expect-error - "vue" is not a member of the closed TechKey union
techPresentation("vue");
