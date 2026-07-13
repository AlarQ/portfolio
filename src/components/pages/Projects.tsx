"use client";

import { useState } from "react";
import { ProjectSummary } from "@/components/ds/ProjectSummary";
import { ProjectTabStrip } from "@/components/ds/ProjectTabStrip";
import type { Project } from "@/data/projects";

export interface ProjectsProps {
  readonly projects: readonly Project[];
  /**
   * Slug → Brief route href, present only for a Project with a matching
   * `content/projects/[slug].mdx` body (FR-9). A plain serializable map, not
   * a function: `app/projects/page.tsx` is a Server Component and this
   * (`pages/Projects`) is a Client Component, so a function prop cannot cross
   * that boundary (RSC serialization). The caller (`projectLoader.ts`'s
   * `hasBrief`) is the only layer that knows about `content/projects/`
   * existence — `pages/Projects`/`ProjectSummary` stay presentation-only.
   */
  readonly briefHrefBySlug?: Readonly<Record<string, string>>;
}

/**
 * `Pages/Projects` screen: lifts `selectedSlug` state and wires the
 * `ProjectTabStrip` organism to the active Project's `ProjectSummary` (FR-6).
 * Selection is entirely client-side — no `next/navigation` router call, no
 * URL change — swapping the summary is just a state update. Array order in
 * `src/data/projects.ts` is authoritative: `projects[0]` is selected on load
 * with no interaction required. The summary swap wrapper uses only
 * `motion-safe:` transition utilities (FR-5, reduced-motion-swap): under
 * `prefers-reduced-motion: reduce` the swap is instant, Tailwind applies no
 * JS media-query polyfill needed.
 */
export function Projects({ projects, briefHrefBySlug }: ProjectsProps) {
  const [selectedSlug, setSelectedSlug] = useState(projects[0]?.slug ?? "");
  const selectedProject = projects.find((project) => project.slug === selectedSlug);

  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-8 px-6">
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
          <ProjectSummary
            project={selectedProject}
            briefHref={briefHrefBySlug?.[selectedProject.slug]}
          />
        </div>
      )}
    </div>
  );
}
