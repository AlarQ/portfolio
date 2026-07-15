import type { BadgeCategory } from "@/components/ui/badgeVariants";
import type { StatusTone } from "@/components/ui/statusDotVariants";
import type { RepoRole, Status, TechKey } from "@/data/projects";

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

/** Below this, a Project reads as too early to carry its Status's own tone. */
// PROVISIONAL: 10 is a design-owner-agreed placeholder, not data-derived —
// revisit once real product input on "too early" is available.
const LOW_MVP_PROGRESS_THRESHOLD = 10;

/** Pure predicate: is `mvpProgress` low enough to force a muted tone (FR-3)? */
export function isLowMvpProgress(mvpProgress: number): boolean {
  return mvpProgress < LOW_MVP_PROGRESS_THRESHOLD;
}

/**
 * Resolve a Project `Status` (+ optional `mvpProgress`) to its `{tone, label,
 * dot}` presentation triple. A non-exploring Project with low `mvpProgress`
 * also resolves to a `muted` tone — de-emphasis is a seam rule, not a
 * component branch (FR-3). `label` always reflects the Status's own text;
 * only `tone`/`dot` are muted by low `mvpProgress`.
 */
export function projectPresentation(status: Status, mvpProgress?: number): StatusPresentation {
  const { tone, label } = STATUS_PRESENTATION[status];
  const resolvedTone = mvpProgress !== undefined && isLowMvpProgress(mvpProgress) ? "muted" : tone;
  return { tone: resolvedTone, label, dot: resolvedTone };
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
  rust: "orange",
  axum: "rose",
  postgres: "indigo",
};

/** Resolve a Project `TechKey` to its Badge hue. */
export function techPresentation(key: TechKey): BadgeCategory {
  return TECH_HUES[key];
}

/** Closed RepoRole → display label map — the role analogue of TECH_HUES.
 *  Exhaustive: a RepoRole without a label here is a compile error. */
const REPO_ROLE_LABELS: Record<RepoRole, string> = {
  frontend: "Frontend",
  backend: "Backend",
};

/** Resolve a ProjectRepo `RepoRole` to its display label. */
export function repoRolePresentation(role: RepoRole): string {
  return REPO_ROLE_LABELS[role];
}
