import type { BadgeCategory } from "@/components/ui/badgeVariants";
import type { CategoryName } from "@/data/categories";

/**
 * Single seam mapping a Post `CategoryName` (product vocabulary, `categories.ts`)
 * to its decorative `BadgeCategory` hue - the category analogue of
 * `skillPresentation`'s exhaustive `Record<IconKey, …>` (ADR-RM-2). Components
 * ask this seam for a hue and never encode a category→color switch themselves;
 * `src/data/` stays color-free.
 *
 * The `Record<CategoryName, BadgeCategory>` is exhaustive: a missing vocabulary
 * entry is a TypeScript compile error, never a silent runtime fallback.
 *
 * R-4 cross-pack dependency: the hue values below are the design-system's
 * `BADGE_CATEGORIES` union. A future `BadgeCategory` rename/removal surfaces
 * here as a compile error - intended, but edit this map, not the call sites.
 */
const CATEGORY_HUES: Record<CategoryName, BadgeCategory> = {
  Leadership: "violet",
  Management: "gray-blue",
  Presentation: "pink",
  Engineering: "indigo",
  AI: "sky",
  Workflow: "green",
  Rust: "orange",
  Monorepo: "rose",
};

/** Resolve a vocabulary category name to its Badge hue. */
export function categoryPresentation(name: CategoryName): BadgeCategory {
  return CATEGORY_HUES[name];
}
