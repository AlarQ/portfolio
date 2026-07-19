import type { BadgeCategory } from "@/components/ui/badgeVariants";
import type { SkillLevel } from "@/data/domains";

export interface SkillLevelPresentation {
  readonly label: string;
  readonly category: BadgeCategory;
}

/**
 * Single seam resolving a `SkillLevel` to its presentation pair (label + Badge
 * hue) - the author-model analogue of `projectPresentation`'s
 * `STATUS_PRESENTATION` / `TECH_HUES`. `src/data/domains.ts` stays JSX/color
 * free; components ask this seam for a Skill's label/hue and never encode a
 * level→hue switch themselves.
 *
 * The `Record<SkillLevel, …>` is exhaustive: adding a `SkillLevel` member
 * without a matching entry here is a TypeScript compile error, never a silent
 * runtime fallback (mirrors `CATEGORY_HUES`).
 */
const SKILL_LEVEL_PRESENTATION: Record<SkillLevel, SkillLevelPresentation> = {
  expert: { label: "Expert", category: "green" },
  proficient: { label: "Proficient", category: "sky" },
};

/** Resolve a `SkillLevel` to its `{ label, category }` presentation pair. */
export function skillPresentation(level: SkillLevel): SkillLevelPresentation {
  return SKILL_LEVEL_PRESENTATION[level];
}
