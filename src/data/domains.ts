/**
 * A Skill's proficiency within a Domain Area — an ordinal, closed vocabulary.
 * The level → visual resolution (label + Badge hue) lives in the sibling
 * `src/utils/skillPresentation.tsx` seam via an exhaustive
 * `Record<SkillLevel, …>`; this module stays JSX/color/icon-free (seam
 * pattern, mirrors `src/data/projects.ts`). Adding a level here is a compile
 * error until the seam maps it.
 */
export type SkillLevel = "expert" | "proficient";

/**
 * A concrete, outcome-oriented thing the owner delivered within a Domain Area
 * — past tense, evidence. The Achievement view of an area (what was done),
 * paired with the Skill view (what the owner can do).
 */
export interface Achievement {
  readonly id: string;
  readonly description: string;
}

/**
 * A durable capability the owner holds within a Domain Area — present tense,
 * rated. Carries a `level` and optional `years` of experience.
 */
export interface Skill {
  readonly name: string;
  readonly level: SkillLevel;
  readonly years?: number;
}

/**
 * A field of expertise the owner works in. Evidenced by `achievements` and
 * rated by `skills` — two views of one area. `headline` is the area's offering
 * (rendered by `AreaHeadlineCard`).
 */
export interface DomainArea {
  readonly id: string;
  readonly name: string;
  readonly headline: string;
  readonly achievements: readonly Achievement[];
  readonly skills: readonly Skill[];
}

export const domainAreas: readonly DomainArea[] = [];
