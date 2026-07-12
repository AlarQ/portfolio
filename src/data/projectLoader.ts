import type { Project } from "./projects";
import { SLUG_PATTERN } from "./slug";

/**
 * Pure core of the Project loader.
 *
 * Validates every candidate's slug against the blog-identical
 * `^[a-z0-9-]+$` gate (FR-2, `./slug`). `projects.ts`'s owner-curated array is
 * authored directly in code — there is no filesystem read or frontmatter to
 * parse for this metadata — so the "raw input" here is simply the candidate
 * `Project[]`. This is the single slug-validation gate for Projects, mirroring
 * `buildPostSet`: an invalid slug is skipped with a build warning and never
 * reaches a filesystem join (no `fs` import in this module). Filtering
 * preserves input order — the caller's declaration order is the authoritative
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
