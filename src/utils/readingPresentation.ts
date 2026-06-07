import type { ReadingCategory } from "@/data/books";

/**
 * Single seam for how a Reading is presented. The category color a caller needs
 * to render a Reading is resolved here, so the view never defines its own color
 * map. The map is exhaustive (`Record<ReadingCategory, ...>`): a missing entry
 * is a compile error, never a silent runtime gap.
 */

const CATEGORY_COLORS: Record<ReadingCategory, string> = {
  IT: "#0ea5e9",
  "Self-Development": "#84cc16",
  Business: "#f97316",
  Fiction: "#a855f7",
  Other: "#64748b",
};

/** The color used to present a ReadingCategory (e.g. its chip). */
export function readingCategoryColor(category: ReadingCategory): string {
  return CATEGORY_COLORS[category];
}
