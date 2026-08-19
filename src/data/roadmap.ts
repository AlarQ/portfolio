import type { Feature, Roadmap } from "./projects";

/** Derived (never stored) view of a Roadmap's Milestone Progress. */
export interface MilestoneProgress {
  readonly milestoneName: string;
  readonly toward: readonly Feature[];
  readonly beyond: readonly Feature[];
  readonly shippedToward: number;
  readonly totalToward: number;
  /** 0..1, `beyond` Features never counted (progress-ignores-beyond). */
  readonly progress: number;
  /** `progress` rounded to a 0..100 whole percent - the single derived
   *  source every caller (meter value, figure/legend copy) reads from,
   *  rather than each re-deriving `Math.round(progress * 100)`. */
  readonly percent: number;
}

/**
 * Derives a Roadmap's Milestone Progress: `toward`/`beyond` Features split
 * (authored order preserved within each group), `shipped` count among
 * `toward` only, and `progress` as a 0..1 fraction (0 when there are no
 * `toward` Features, rather than dividing by zero).
 */
export function deriveMilestoneProgress(roadmap: Roadmap): MilestoneProgress {
  const toward = roadmap.features.filter((feature) => feature.phase === "toward");
  const beyond = roadmap.features.filter((feature) => feature.phase === "beyond");
  const shippedToward = toward.filter((feature) => feature.status === "shipped").length;
  const totalToward = toward.length;
  const progress = totalToward === 0 ? 0 : shippedToward / totalToward;

  return {
    milestoneName: roadmap.milestoneName,
    toward,
    beyond,
    shippedToward,
    totalToward,
    progress,
    percent: Math.round(progress * 100),
  };
}
