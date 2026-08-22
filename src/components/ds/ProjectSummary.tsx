import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import type { Project } from "@/data/projects";
import { RepoTechRows } from "./RepoTechRows";

export interface ProjectSummaryProps {
  readonly project: Project;
  /** The Project's Milestone Progress as a 0..100 meter value, pre-derived
   *  by the caller via `deriveMilestoneProgress(project.roadmap)` - never
   *  computed here (FR-8). */
  readonly percent: number;
  /** The meter's legend text, pre-resolved via `milestoneLegend(progress)` -
   *  required (`meter-legend-required`), never hardcoded. */
  readonly legend: string;
}

/**
 * `ds/` organism rendering the `/projects/[slug]` detail route's header
 * block (FR-8): the Project title (`h1` - this **is** the page title, and
 * `Header` renders no `h1` on this route), tagline, per-Repo tech Badges
 * (via `RepoTechRows`), related Posts, and the page's only meter - one
 * inline row combining the `ui/meter` bar + legend with a real **Roadmap ↓**
 * jump link to `#roadmap`. Carries no Brief content - the Brief renders
 * separately in `pages/ProjectDetail`.
 */
export function ProjectSummary({ project, percent, legend }: ProjectSummaryProps) {
  return (
    <section aria-labelledby="project-summary-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 id="project-summary-heading" className="text-2xl font-semibold text-foreground">
          {project.title}
        </h1>
        <p className="text-muted-foreground">{project.tagline}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Meter value={percent} legend={legend} className="max-w-sm" />
        <a
          href="#roadmap"
          className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Roadmap ↓
        </a>
      </div>

      <RepoTechRows repos={project.repos} />

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
