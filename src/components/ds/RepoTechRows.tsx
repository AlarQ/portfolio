import { Badge } from "@/components/ui/badge";
import type { ProjectRepo } from "@/data/projects";
import { repoRolePresentation, techPresentation } from "@/utils/projectPresentation";

export interface RepoTechRowsProps {
  readonly repos: readonly ProjectRepo[];
}

/**
 * `ds/` molecule rendering a Project's per-Repo Tech stack Badge rows,
 * extracted out of `ProjectSummary` (batch 2A) so both it and `ProjectCard`
 * share one implementation instead of duplicating the role-label-gutter
 * logic. The role-label gutter (`repoRolePresentation`) only renders when
 * there is more than one Repo - a single-Repo Project shows a plain Badge
 * row. Every hue comes from `techPresentation` - never a raw literal switch
 * here. Renders nothing when `repos` is empty.
 */
export function RepoTechRows({ repos }: RepoTechRowsProps) {
  if (repos.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {repos.map((repo, index) => (
        <div
          key={`${repo.role}-${index}`}
          className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
        >
          {repos.length > 1 && (
            <span className="w-24 shrink-0 pt-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {repoRolePresentation(repo.role)}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            {repo.techKeys.map((techKey) => (
              <Badge key={techKey} category={techPresentation(techKey)}>
                {techKey}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
