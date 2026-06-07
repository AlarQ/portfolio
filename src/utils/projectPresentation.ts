/**
 * Single seam for how a Project is presented. The MVP Progress color rule — the
 * business threshold that maps a completion percentage to a palette tone — lives
 * here, not in the Card. Returning a theme palette key (rather than a literal
 * color) keeps the rule pure and unit-testable without rendering, while color
 * resolution stays with the theme. Mirrors `skillPresentation` /
 * `readingPresentation`.
 */

/** The palette tone used to present an MVP Progress value. */
export type MvpProgressTone = "success" | "primary" | "secondary";

/**
 * Maps an MVP Progress percentage to its palette tone:
 * ≥80 → success, ≥50 → primary, otherwise secondary.
 */
export function mvpProgressTone(progress: number): MvpProgressTone {
  if (progress >= 80) return "success";
  if (progress >= 50) return "primary";
  return "secondary";
}
