import type { ReactNode } from "react";
import { CapabilitiesSection } from "@/components/ds/CapabilitiesSection";
import { ProjectSummary } from "@/components/ds/ProjectSummary";
import { RoadmapSection } from "@/components/ds/RoadmapSection";
import type { Project } from "@/data/projects";
import { deriveMilestoneProgress } from "@/data/roadmap";
import { milestoneLegend, resolveCapabilityMedia } from "@/utils/projectPresentation";

export interface ProjectDetailProps {
  readonly project: Project;
  /** The rendered Brief MDX body - passed as children so this page component
   *  stays a plain server component with no `fs`/dynamic-`import()` of its
   *  own (the route owns the MDX import, mirrors `SinglePost`). */
  readonly children: ReactNode;
}

/**
 * `Pages/ProjectDetail` screen: the `/projects/[slug]` detail route's body
 * (FR-6). Computes `deriveMilestoneProgress`, `milestoneLegend`, and
 * `resolveCapabilityMedia` server-side from the seam - never passed a
 * pre-derived shape from the route - and stacks, in order, header
 * (`ProjectSummary`) → `CapabilitiesSection` → `RoadmapSection` → Brief
 * prose (detail-order). No client state; no switcher.
 */
export function ProjectDetail({ project, children }: ProjectDetailProps) {
  const progress = deriveMilestoneProgress(project.roadmap);
  const legend = milestoneLegend(progress);
  const capabilities = resolveCapabilityMedia(project);

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-10 px-6">
      <ProjectSummary project={project} percent={progress.percent} legend={legend} />
      <CapabilitiesSection capabilities={capabilities} />
      <RoadmapSection progress={progress} />
      <section
        aria-label="Project brief"
        className="flex flex-col gap-4 border-t border-border pt-6 text-foreground [&_p]:leading-relaxed [&>h2]:text-xl [&>h2]:font-semibold"
      >
        {children}
      </section>
    </div>
  );
}
