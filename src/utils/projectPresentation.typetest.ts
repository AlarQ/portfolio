import { projectPresentation, techPresentation } from "./projectPresentation";

/**
 * Type-only fixture (never imported at runtime) proving both the
 * `Status → {tone,label,dot}` map and the `TechKey → BadgeCategory` map in
 * `projectPresentation.tsx` are closed compile-time contracts, not runtime
 * fallbacks — the Project analogue of `categoryPresentation.typetest.tsx` and
 * `statusDotVariants.typetest.ts`. Checked via the whole-project
 * `npx tsc --noEmit` that `projectPresentation.typetest.test.ts` runs.
 */
// @ts-expect-error — "cancelled" is not a member of the closed Status union
projectPresentation("cancelled");

// @ts-expect-error — "vue" is not a member of the closed TechKey union
techPresentation("vue");
