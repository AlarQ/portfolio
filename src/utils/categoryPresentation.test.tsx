import { describe, expect, it } from "vitest";
import { BADGE_CATEGORIES } from "@/components/ui/badgeVariants";
import { CATEGORY_NAMES } from "@/data/categories";
import { categoryPresentation } from "./categoryPresentation";

/**
 * Integration seam for task 002: the vocabulary the loader validates against
 * (`categories.ts`) and the hues the seam exhaustively maps must be the same
 * set. This round-trip proves every `CategoryName` resolves through the seam's
 * `Record<CategoryName, BadgeCategory>` to a real `BadgeCategory` hue — the
 * runtime counterpart to the compile-error typetest.
 */
describe("categoryPresentation — vocabulary ↔ seam Record", () => {
  it("resolves every vocabulary category to a valid BadgeCategory hue", () => {
    for (const name of CATEGORY_NAMES) {
      expect(BADGE_CATEGORIES).toContain(categoryPresentation(name));
    }
  });
});
