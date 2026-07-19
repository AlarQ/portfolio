import { categoryPresentation } from "./categoryPresentation";

/**
 * Type-only fixture (never imported at runtime, never run by vitest) proving the
 * seam's `Record<CategoryName, BadgeCategory>` is a closed compile-time contract,
 * not a runtime fallback (ADR-RM-2) - the category analogue of
 * `badgeVariants.typetest.ts`. Type-checked by the whole-project `npx tsc
 * --noEmit` that `badgeVariants.typetest.test.ts` already runs: a correct
 * `@ts-expect-error` keeps that check green; a category the seam wrongly admitted
 * would flip it red.
 */
// @ts-expect-error - "NotACategory" is not a member of the CategoryName vocabulary
categoryPresentation("NotACategory");
