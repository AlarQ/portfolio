import {
  applyProjectAuthoringRules,
  buildProjectSet,
  filterProjectsWithBrief,
} from "../projectLoader";
import { bondsmith } from "./bondsmith";
import { hyperion } from "./hyperion";

/**
 * Closed tech-stack vocabulary. Each key is resolved to a `BadgeCategory` hue
 * in the presentation seam (task 003) via an exhaustive `Record<TechKey, …>` -
 * a key outside this union is a compile error, never a runtime gap.
 */
export type TechKey =
  | "nextjs"
  | "react"
  | "typescript"
  | "tailwind"
  | "mdx"
  | "shadcn"
  | "biome"
  | "playwright"
  | "rss"
  | "node"
  | "claude"
  | "rust"
  | "tokio"
  | "axum"
  | "postgres";

/** An on-site link from a Project to a related Post (Project → Post only). */
export interface RelatedPostRef {
  readonly label: string;
  readonly slug: string;
}

/** A source repository comprising a Project, carrying a role and its own
 *  subset of the Tech stack. The role's human label (Frontend/Backend) is
 *  presentation and lives in `projectPresentation.tsx`, not here. */
export type RepoRole = "frontend" | "backend";

export interface ProjectRepo {
  readonly role: RepoRole;
  readonly techKeys: readonly TechKey[];
}

/** Whether a Roadmap Feature has shipped, is in progress, or is only planned.
 *  Resolved to a `StatusTone`/label in the presentation seam - a member added
 *  here without a matching seam entry is a compile error (status-tone-exhaustive). */
export type FeatureStatus = "shipped" | "in-progress" | "planned";

/** Whether a Feature counts toward the current Milestone or is scoped beyond
 *  it. `beyond` Features never affect Milestone Progress (progress-ignores-beyond). */
export type FeaturePhase = "toward" | "beyond";

export interface Feature {
  readonly name: string;
  readonly status: FeatureStatus;
  readonly phase: FeaturePhase;
}

/** A Project's Roadmap: a single named Milestone and its Features, authored
 *  order authoritative (no `order` field, no dates, no `current` flag). */
export interface Roadmap {
  readonly milestoneName: string;
  readonly features: readonly Feature[];
}

/**
 * A Capability's optional media - one clip (with poster) or one still. Bare,
 * pattern-gated filenames only (never a URL literal); the presentation seam
 * (FR-4) resolves these to actual URLs against `mediaConfig`.
 */
export type CapabilityMedia =
  | {
      readonly kind: "clip";
      readonly clip: string;
      readonly poster: string;
      readonly label: string;
      readonly description: string;
    }
  | {
      readonly kind: "still";
      readonly still: string;
      readonly alt: string;
    };

/** A single demonstrated Capability of a Project: a text claim true without
 *  its (optional) media. Absent `media` renders as a text-only row. */
export interface Capability {
  readonly text: string;
  readonly media?: CapabilityMedia;
}

/**
 * A single Project record: the domain data behind a Project summary card,
 * its detail route, and its inline Brief section. Authored directly in the
 * per-Project modules below - no CMS, no MDX frontmatter parsing for this
 * metadata (the Brief *body* is separate MDX under `content/projects/`).
 * Carries no JSX, color literal, or icon.
 */
export interface Project {
  readonly title: string;
  readonly slug: string;
  readonly tagline: string;
  readonly repos: readonly ProjectRepo[];
  readonly relatedPosts: readonly RelatedPostRef[];
  /** Required, may be empty - present-but-empty is a data state; nothing
   *  branches on `undefined` (no-capabilities-no-section). */
  readonly capabilities: readonly Capability[];
  readonly roadmap: Roadmap;
}

/**
 * The owner-curated, manually-ordered Project set - the single source of
 * truth for the Project concept (FR-1) and, once run through
 * `buildProjectSet`, the authoritative validated slug set every downstream
 * layer consumes (FR-2). Array order is authoritative: the first entry is the
 * default-selected Project on `/projects` (array-order-authoritative). One
 * module per Project (`./hyperion`, `./bondsmith`) - no per-concept split
 * files, no `order` field.
 */
export const projects: readonly Project[] = [hyperion, bondsmith];

/**
 * The validated, Brief-having, authoring-rule-applied Project set - computed
 * once at module load so repeated calls to `getProjects()` share a single
 * pass instead of recomputing (and re-warning) on every call. Mirrors
 * `getPosts()` in `posts.ts`.
 */
const publishedProjects: readonly Project[] = applyProjectAuthoringRules(
  filterProjectsWithBrief(buildProjectSet(projects))
);

/** The single public source of Projects that have a Brief. */
export function getProjects(): readonly Project[] {
  return publishedProjects;
}

/** Look up a single published Project by slug (mirrors `getPost(slug)`). */
export function getProject(slug: string): Project | undefined {
  return publishedProjects.find((project) => project.slug === slug);
}
