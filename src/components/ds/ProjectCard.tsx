import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/data/projects";
import { RepoTechRows } from "./RepoTechRows";

export interface ProjectCardProps {
  readonly project: Project;
  /** The Milestone Progress figure text, pre-resolved by the caller via
   *  `milestoneFigure(deriveMilestoneProgress(project.roadmap))` - the seam
   *  output, never computed here (FR-7). */
  readonly figure: string;
  /** The Project's detail route, e.g. `/projects/<slug>`. */
  readonly href: string;
}

/**
 * `ds/` organism rendering one Project on the `/projects` index (FR-7): a
 * `ui/card` carrying title, tagline, per-Repo tech Badges (via
 * `RepoTechRows`), and the light inline Milestone Progress figure - no meter
 * bar, no poster thumbnail (those live only on the detail header, FR-8). The
 * whole card is reachable via a single `Link` on the title so there is
 * exactly one focusable, accessibly-named hit target per card.
 */
export function ProjectCard({ project, figure, href }: ProjectCardProps) {
  return (
    <Card className="gap-4">
      <CardHeader className="gap-2 px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <CardTitle className="text-xl">
            <Link
              href={href}
              className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {project.title}
            </Link>
          </CardTitle>
          <span data-slot="milestone-figure" className="text-sm font-medium text-muted-foreground">
            {figure}
          </span>
        </div>
        <CardDescription>{project.tagline}</CardDescription>
      </CardHeader>
      <div className="px-6">
        <RepoTechRows repos={project.repos} />
      </div>
    </Card>
  );
}
