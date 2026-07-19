import { statusDotVariants } from "./statusDotVariants";

/**
 * Type-only fixture (never imported at runtime) proving the closed
 * `tone` union is a compile-time contract, not a runtime fallback -
 * the type-level analogue of `skillPresentation.tsx`'s exhaustive
 * `Record<IconKey, …>`. Checked via `tsc --noEmit` in
 * statusDotVariants.typetest.test.ts.
 */
// @ts-expect-error - "danger" is not a member of STATUS_TONES
statusDotVariants({ tone: "danger" });
