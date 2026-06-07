import type { ReadingCategory } from "@/data/books";
import { brand } from "@/theme/theme";

/**
 * Single seam for how a Reading is presented. The category color a caller needs
 * to render a Reading is resolved here, so the view never defines its own color
 * map. The map is exhaustive (`Record<ReadingCategory, ...>`): a missing entry
 * is a compile error, never a silent runtime gap.
 */

const CATEGORY_COLORS: Record<ReadingCategory, string> = {
  IT: brand.sky,
  "Self-Development": brand.lime,
  Business: brand.orange,
  Fiction: brand.violet,
  Other: brand.slate,
};

/** The color used to present a ReadingCategory (e.g. its chip). */
export function readingCategoryColor(category: ReadingCategory): string {
  return CATEGORY_COLORS[category];
}
