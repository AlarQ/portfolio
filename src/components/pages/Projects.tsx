"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ProjectSummary } from "@/components/ds/ProjectSummary";
import { ProjectTabStrip } from "@/components/ds/ProjectTabStrip";
import type { Project } from "@/data/projects";

export interface ProjectsProps {
  readonly projects: readonly Project[];
  /** Pre-rendered Brief content keyed by slug, for Projects with a
   *  `content/projects/<slug>.mdx` Brief - rendered server-side by the
   *  `/projects` route and threaded down (this screen is client-side and
   *  can't touch `fs` itself). */
  readonly briefs: Readonly<Record<string, ReactNode>>;
}

/**
 * `Pages/Projects` screen: lifts `selectedSlug` state and wires the
 * `ProjectTabStrip` organism to the active Project's `ProjectSummary` (FR-6).
 * Selection is entirely client-side - no `next/navigation` router call, no
 * URL change - swapping the summary is just a state update. Array order in
 * `src/data/projects.ts` is authoritative: `projects[0]` is selected on load
 * with no interaction required. The summary swap wrapper uses only
 * `motion-safe:` transition utilities (FR-5, reduced-motion-swap): under
 * `prefers-reduced-motion: reduce` the swap is instant, Tailwind applies no
 * JS media-query polyfill needed.
 */
export function Projects({ projects, briefs }: ProjectsProps) {
  const [selectedSlug, setSelectedSlug] = useState(projects[0]?.slug ?? "");
  const selectedProject = projects.find((project) => project.slug === selectedSlug);

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-8 px-6">
      <p className="text-muted-foreground">
        The page presents projects I&apos;m now working on, describing how they look from a
        high-level view. I&apos;ll share more detail in upcoming posts.
      </p>
      <ProjectTabStrip
        projects={projects}
        selectedSlug={selectedSlug}
        onSelectSlug={setSelectedSlug}
      />
      {selectedProject && (
        <div
          key={selectedProject.slug}
          data-testid="project-summary-swap"
          role="tabpanel"
          id={`project-panel-${selectedProject.slug}`}
          aria-labelledby={`project-tab-${selectedProject.slug}`}
          className="motion-safe:transition-opacity motion-safe:duration-200 motion-reduce:transition-none"
        >
          <ProjectSummary project={selectedProject} brief={briefs[selectedProject.slug]} />
        </div>
      )}
    </div>
  );
}
