import { describe, expect, it } from "vitest";
import { BADGE_CATEGORIES, badgeCategoryVariants } from "./badgeVariants";

/**
 * FR-6: Badge category styling as an exhaustive CVA taxonomy — the shadcn
 * analogue of `skillPresentation`'s `Record<IconKey, …>`. A missing category
 * is a compile error (BADGE_CATEGORIES is the closed union `Badge`'s
 * `category` prop is typed against), never a silent runtime fallback.
 */
describe("Badge category CVA map is an exhaustive 8-hue taxonomy (FR-6)", () => {
  it("defines exactly the 8 category hues", () => {
    expect(BADGE_CATEGORIES).toEqual([
      "violet",
      "indigo",
      "pink",
      "sky",
      "green",
      "gray-blue",
      "orange",
      "rose",
    ]);
  });

  it.each(
    BADGE_CATEGORIES
  )("category %s resolves to a semantic-token class, never inline hex", (category) => {
    const className = badgeCategoryVariants({ category });

    expect(className).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(className).toContain(`bg-badge-${category}-bg`);
    expect(className).toContain(`text-badge-${category}-fg`);
  });
});
