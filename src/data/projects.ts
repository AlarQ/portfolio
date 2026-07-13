import { buildProjectSet, filterProjectsWithBrief } from "./projectLoader";

/**
 * A Project's build/delivery status. Presentation labels (`Exploring`,
 * `In progress`, `Shipped`) and tone resolution are owned by the presentation
 * seam (`projectPresentation.tsx`, task 003) — this module stays JSX/color/icon
 * free (seam pattern, mirrors `posts.ts`/`domains.ts`).
 */
export type Status = "exploring" | "in-progress" | "shipped";

/**
 * Closed tech-stack vocabulary. Each key is resolved to a `BadgeCategory` hue
 * in the presentation seam (task 003) via an exhaustive `Record<TechKey, …>` —
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
  | "claude";

/** An on-site link from a Project to a related Post (Project → Post only). */
export interface RelatedPostRef {
  readonly label: string;
  readonly slug: string;
}

/**
 * A single Project record: the domain data behind a Project summary card and
 * its Brief detail page. Authored directly in `projects` below — no CMS, no
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
  readonly techStack: readonly TechKey[];
  readonly relatedPosts: readonly RelatedPostRef[];
}

/**
 * The owner-curated, manually-ordered Project set — the single source of
 * truth for the Project concept (FR-1) and, once run through
 * `buildProjectSet`, the authoritative validated slug set every downstream
 * layer consumes (FR-2). Array order is authoritative: the first entry is the
 * default-selected Project on `/projects`.
 */
export const projects: readonly Project[] = [
  {
    title: "Portfolio Site",
    slug: "portfolio-site",
    tagline: "This site — a statically-generated portfolio and blog.",
    status: "in-progress",
    mvpProgress: 80,
    currentState: "Building the Projects tab on top of the existing seam-pattern architecture.",
    techStack: [
      "nextjs",
      "react",
      "typescript",
      "tailwind",
      "shadcn",
      "mdx",
      "biome",
      "playwright",
    ],
    relatedPosts: [],
  },
];

/**
 * The validated, Brief-having Project set — computed once at module load so
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
