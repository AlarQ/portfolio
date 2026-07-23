import type { BadgeCategory } from "@/components/ui/badgeVariants";
import type { RepoRole, TechKey } from "@/data/projects";

/**
 * Closed `TechKey → BadgeCategory` map - the tech-stack analogue of
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

/** Closed RepoRole → display label map - the role analogue of TECH_HUES.
 *  Exhaustive: a RepoRole without a label here is a compile error. */
const REPO_ROLE_LABELS: Record<RepoRole, string> = {
  frontend: "Frontend",
  backend: "Backend",
};

/** Resolve a ProjectRepo `RepoRole` to its display label. */
export function repoRolePresentation(role: RepoRole): string {
  return REPO_ROLE_LABELS[role];
}
