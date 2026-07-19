import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Project } from "./projects";
import { SLUG_PATTERN } from "./slug";

const CONTENT_PROJECTS_DIR = join(process.cwd(), "content", "projects");

/**
 * Pure core of the Project loader.
 *
 * Validates every candidate's slug against the blog-identical
 * `^[a-z0-9-]+$` gate (FR-2, `./slug`). `projects.ts`'s owner-curated array is
 * authored directly in code - there is no filesystem read or frontmatter to
 * parse for this metadata - so the "raw input" here is simply the candidate
 * `Project[]`. This is the single slug-validation gate for Projects, mirroring
 * `buildPostSet`: an invalid slug is skipped with a build warning and never
 * reaches a filesystem join (no `fs` import in this module). Filtering
 * preserves input order - the caller's declaration order is the authoritative
 * iteration order (first entry is the default-selected Project).
 */
export function buildProjectSet(candidates: readonly Project[]): Project[] {
  return candidates.filter(isSlugValid);
}

function isSlugValid(project: Project): boolean {
  if (SLUG_PATTERN.test(project.slug)) return true;
  console.warn(
    `[projects] skipping project with invalid slug "${project.slug}": must match ${SLUG_PATTERN}`
  );
  return false;
}

/**
 * Checks whether an already-validated Project slug has a matching Brief body
 * under `content/projects/`. This is an EXISTENCE check for a single,
 * already-known candidate - never a directory scan (no `readdirSync`) - so it
 * cannot introduce a new slug into the route set; the enumerate-not-glob
 * authority stays solely with `buildProjectSet`/`projects.ts` (FR-8/FR-9).
 */
export function hasBrief(slug: string): boolean {
  return existsSync(join(CONTENT_PROJECTS_DIR, `${slug}.mdx`));
}

/**
 * Filters an already-validated Project[] (`buildProjectSet` output) down to
 * those with a Brief body, warning once per Project skipped (FR-9,
 * missing-brief-warning) - mirrors the build-warning style of `isSlugValid`
 * above / `postLoader.ts`'s `isSlugValid`. `briefExists` defaults to the real
 * filesystem check (`hasBrief`) but is injectable so this stays testable
 * without touching disk.
 */
export function filterProjectsWithBrief(
  validatedProjects: readonly Project[],
  briefExists: (slug: string) => boolean = hasBrief
): Project[] {
  return validatedProjects.filter((project) => {
    if (briefExists(project.slug)) return true;
    console.warn(`[projects] no Brief found for "${project.slug}" - skipping its route`);
    return false;
  });
}
