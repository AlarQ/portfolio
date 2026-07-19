import type { TechKey } from "./projects";

/**
 * Type-only fixture (never imported at runtime) proving `TechKey` is a closed
 * compile-time union, not a runtime-checked string - the type-level analogue
 * of `badgeVariants.typetest.ts`'s closed-category check. Verified via
 * `tsc --noEmit`, which is exercised by the existing
 * `badgeVariants.typetest.test.ts` runner over the whole project.
 */
function acceptsTechKey(_key: TechKey): void {}

// @ts-expect-error - "not-a-real-tech" is not a member of the closed TechKey union
acceptsTechKey("not-a-real-tech");
