import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { StatusDot } from "@/components/ui/status-dot";
import type { Project } from "@/data/projects";
import {
  projectPresentation,
  repoRolePresentation,
  techPresentation,
} from "@/utils/projectPresentation";

export interface ProjectSummaryProps {
  readonly project: Project;
}

/**
 * `ds/` organism rendering the active Project's summary panel - the detail
 * pane driven by `ProjectTabStrip`'s selection (FR-6, FR-7). Renders every
 * field from seam output only: Status tone/label via `projectPresentation`,
 * tech-stack hues via `techPresentation` (mirrors how `SinglePost` consumes
 * `categoryPresentation` for Post categories) - never a raw literal switch
 * here. Tech is grouped per Repo via `repoRolePresentation` + `techPresentation`.
 */
export function ProjectSummary({ project }: ProjectSummaryProps) {
  const { tone, label } = projectPresentation(project.status, project.mvpProgress);

  return (
    <section aria-labelledby="project-summary-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="project-summary-heading" className="text-2xl font-semibold text-foreground">
          {project.title}
        </h2>
        <p className="text-muted-foreground">{project.tagline}</p>
      </div>

      <div className="flex items-center gap-2">
        <StatusDot tone={tone} />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>

      <Meter value={project.mvpProgress} />

      <p className="text-foreground">{project.currentState}</p>

      {project.repos.length > 0 && (
        <div className="flex flex-col gap-3">
          {project.repos.map((repo, index) => (
            <div
              key={`${repo.role}-${index}`}
              className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
            >
              {project.repos.length > 1 && (
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
      )}

      {project.relatedPosts.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            From the blog
          </span>
          <div className="flex flex-wrap gap-2">
            {project.relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                href={`/blog/${relatedPost.slug}`}
                className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="min-w-40 max-w-56 gap-1 py-3 px-3 transition-colors hover:border-primary/50">
                  <CardHeader className="gap-0.5 px-0">
                    <CardDescription className="text-xs uppercase">Post</CardDescription>
                    <CardTitle className="text-sm">{relatedPost.label}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
