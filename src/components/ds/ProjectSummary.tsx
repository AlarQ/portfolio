import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Meter } from "@/components/ui/meter";
import { StatusDot } from "@/components/ui/status-dot";
import type { Project } from "@/data/projects";
import { projectPresentation, techPresentation } from "@/utils/projectPresentation";

export interface ProjectSummaryProps {
  readonly project: Project;
  /**
   * Href for the "Read full brief" link. Deliberately NOT part of the
   * `Project` domain type (FR-9): a Project with no `content/projects/
   * [slug].mdx` body has no brief route, so the link is omitted entirely
   * rather than pointing at a 404. Fixture-driven from the caller (`pages/
   * Projects`, once FR-8 wires the Brief route) — presentation-only.
   */
  readonly briefHref?: string;
}

/**
 * `ds/` organism rendering the active Project's summary panel — the detail
 * pane driven by `ProjectTabStrip`'s selection (FR-6, FR-7). Renders every
 * field from seam output only: Status tone/label via `projectPresentation`,
 * tech-stack hues via `techPresentation` (mirrors how `SinglePost` consumes
 * `categoryPresentation` for Post categories) — never a raw literal switch
 * here.
 */
export function ProjectSummary({ project, briefHref }: ProjectSummaryProps) {
  const { tone, label } = projectPresentation(project.status);

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

      {project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((techKey) => (
            <Badge key={techKey} category={techPresentation(techKey)}>
              {techKey}
            </Badge>
          ))}
        </div>
      )}

      {project.relatedPosts.length > 0 && (
        <ul className="flex flex-col gap-1">
          {project.relatedPosts.map((relatedPost) => (
            <li key={relatedPost.slug}>
              <Link href={`/blog/${relatedPost.slug}`} className="text-primary underline">
                {relatedPost.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {briefHref && (
        <Link href={briefHref} className="font-medium text-primary underline">
          Read full brief
        </Link>
      )}
    </section>
  );
}
