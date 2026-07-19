import { badgeCategoryVariants } from "./badgeVariants";

/**
 * Type-only fixture (never imported at runtime) proving the closed
 * `category` union is a compile-time contract, not a runtime fallback -
 * the type-level analogue of `skillPresentation.tsx`'s exhaustive
 * `Record<IconKey, …>`. Checked via `tsc --noEmit` in
 * badgeVariants.typetest.test.ts.
 */
// @ts-expect-error - "not-a-real-category" is not a member of BADGE_CATEGORIES
badgeCategoryVariants({ category: "not-a-real-category" });
