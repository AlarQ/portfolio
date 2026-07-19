import { buildProjectSet, filterProjectsWithBrief } from "./projectLoader";

/**
 * A Project's build/delivery status. Presentation labels (`Exploring`,
 * `In progress`, `Shipped`) and tone resolution are owned by the presentation
 * seam (`projectPresentation.tsx`, task 003) - this module stays JSX/color/icon
 * free (seam pattern, mirrors `posts.ts`/`domains.ts`).
 */
export type Status = "exploring" | "in-progress" | "shipped";

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

/**
 * A single Project record: the domain data behind a Project summary card and
 * its Brief detail page. Authored directly in `projects` below - no CMS, no
 * MDX frontmatter parsing for this metadata (the Brief *body* is separate MDX
 * under `content/projects/`). Carries no JSX, color literal, or icon.
 */
export interface Project {
  readonly title: string;
  readonly slug: string;
  readonly tagline: string;
  readonly status: Status;
  /** 0–100: closeness to first usable release, not a completion/abandonment flag. */
  readonly mvpProgress: number;
  readonly currentState: string;
  readonly repos: readonly ProjectRepo[];
  readonly relatedPosts: readonly RelatedPostRef[];
}

/**
 * The owner-curated, manually-ordered Project set - the single source of
 * truth for the Project concept (FR-1) and, once run through
 * `buildProjectSet`, the authoritative validated slug set every downstream
 * layer consumes (FR-2). Array order is authoritative: the first entry is the
 * default-selected Project on `/projects`.
 */
export const projects: readonly Project[] = [
  {
    title: "Hyperion",
    slug: "hyperion",
    tagline:
      "A shared Rust/Axum backend monolith powering several product apps over one Postgres and OpenAPI contract.",
    status: "in-progress",
    mvpProgress: 85,
    currentState:
      "~320 commits, Docker deploy, JWT/Argon2 auth and OpenTelemetry tracing - the backbone behind Job Offer Box and the GTD app.",
    repos: [{ role: "backend", techKeys: ["rust", "axum", "postgres"] }],
    relatedPosts: [{ label: "Pour It Once", slug: "pour-it-once" }],
  },
  {
    title: "Bondsmith",
    slug: "bondsmith",
    tagline:
      "A spec-driven development workflow engine in Rust - phase contracts enforced in typed code, not by an LLM.",
    status: "in-progress",
    mvpProgress: 30,
    currentState:
      "Building the enforcement spine (state store, workspace infra) with swappable LLM runtime adapters.",
    repos: [{ role: "backend", techKeys: ["rust"] }],
    relatedPosts: [],
  },
];

/**
 * The validated, Brief-having Project set - computed once at module load so
 * `generateStaticParams`, `generateMetadata`, and the `/projects/[slug]` page
 * component all share a single `buildProjectSet`/`filterProjectsWithBrief`
 * pass instead of recomputing (and re-warning) on every call. Mirrors
 * `getPosts()` in `posts.ts`.
 */
const projectsWithBrief: readonly Project[] = filterProjectsWithBrief(buildProjectSet(projects));

/** The single public source of Projects that have a Brief route. */
export function getProjects(): readonly Project[] {
  return projectsWithBrief;
}

/**
 * The one per-slug lookup over the Brief-having Project set. Mirrors
 * `getPost`/`getPosts` in `posts.ts` (blog `[slug]` route).
 */
export function getProject(slug: string): Project | undefined {
  return projectsWithBrief.find((project) => project.slug === slug);
}
