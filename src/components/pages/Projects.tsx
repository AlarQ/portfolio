import { ProjectCard } from "@/components/ds/ProjectCard";
import type { Project } from "@/data/projects";
import { deriveMilestoneProgress } from "@/data/roadmap";
import { milestoneFigure } from "@/utils/projectPresentation";

export interface ProjectsProps {
  readonly projects: readonly Project[];
}

/**
 * `Pages/Projects` screen: the `/projects` index (FR-7). Server-safe - no
 * `"use client"`, no state, no tab strip. Array order in
 * `src/data/projects/index.ts` is authoritative: cards render in that order
 * (array-order-authoritative). Each card carries the Milestone Progress
 * light inline figure, pre-resolved via `milestoneFigure(deriveMilestoneProgress(...))`
 * - never computed inside `ProjectCard` itself - and links to its detail
 * route `/projects/<slug>` (FR-6).
 */
export function Projects({ projects }: ProjectsProps) {
  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-8 px-6">
      <p className="text-muted-foreground">
        Projects I&apos;m building right now - what each one lets you do, how far it is toward its
        next milestone, and how it&apos;s built. Open a project for the full brief.
      </p>
      <ul className="flex flex-col gap-6">
        {projects.map((project) => (
          <li key={project.slug}>
            <ProjectCard
              project={project}
              figure={milestoneFigure(deriveMilestoneProgress(project.roadmap))}
              href={`/projects/${project.slug}`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
