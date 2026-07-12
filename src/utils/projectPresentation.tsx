import type { BadgeCategory } from "@/components/ui/badgeVariants";
import type { StatusTone } from "@/components/ui/statusDotVariants";
import type { Status, TechKey } from "@/data/projects";

/**
 * Single seam resolving a Project's `Status` to its presentation triple —
 * the analogue of `categoryPresentation`'s `Record<CategoryName, BadgeCategory>`.
 * `src/data/projects.ts` stays JSX/color-free; components ask this seam for
 * tone/label/dot and never encode a status→tone switch themselves.
 *
 * The `Record<Status, …>` is exhaustive: removing/adding a `Status` member
 * without updating this map is a TypeScript compile error, never a silent
 * runtime fallback (FR-3, mirrors `CATEGORY_HUES`).
 */
const STATUS_PRESENTATION: Record<Status, { tone: StatusTone; label: string }> = {
  exploring: { tone: "muted", label: "Exploring" },
  "in-progress": { tone: "info", label: "In progress" },
  shipped: { tone: "success", label: "Shipped" },
};

export interface StatusPresentation {
  readonly tone: StatusTone;
  readonly label: string;
  readonly dot: StatusTone;
}

/** Resolve a Project `Status` to its `{tone, label, dot}` presentation triple. */
export function projectPresentation(status: Status): StatusPresentation {
  const { tone, label } = STATUS_PRESENTATION[status];
  return { tone, label, dot: tone };
}

/**
 * Closed `TechKey → BadgeCategory` map — the tech-stack analogue of
 * `CATEGORY_HUES`. Exhaustive `Record<TechKey, …>`: a `TechKey` added to
 * `data/projects.ts` without a matching hue here is a compile error.
 */
const TECH_HUES: Record<TechKey, BadgeCategory> = {
  nextjs: "gray-blue",
  react: "sky",
  typescript: "indigo",
  tailwind: "green",
  mdx: "violet",
  shadcn: "pink",
  biome: "orange",
  playwright: "rose",
  rss: "orange",
  node: "green",
  claude: "violet",
};

/** Resolve a Project `TechKey` to its Badge hue. */
export function techPresentation(key: TechKey): BadgeCategory {
  return TECH_HUES[key];
}
