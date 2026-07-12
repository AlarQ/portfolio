"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRef } from "react";
import { StatusDot } from "@/components/ui/status-dot";
import { TabPill } from "@/components/ui/tab-pill";
import type { Project } from "@/data/projects";
import { projectPresentation } from "@/utils/projectPresentation";

export interface ProjectTabStripProps {
  readonly projects: readonly Project[];
  readonly selectedSlug: string;
  readonly onSelectSlug: (slug: string) => void;
}

/**
 * `ds/` organism owning the Project pill-strip's ARIA `tablist` semantics
 * (FR-5, FR-7): roving `tabIndex` (only the selected tab is `0`, every other
 * tab is `-1`), Arrow Left/Right + Home/End keyboard navigation per the ARIA
 * APG tablist pattern, and `aria-selected` tracking. Composed from the
 * `TabPill` atom (visual selected state) and `status-dot` (per-Project
 * Status tone) — both resolved via the `projectPresentation` seam, never
 * inline here. Presentational: selection is fully controlled by the caller
 * via `selectedSlug`/`onSelectSlug` (mirrors `Pagination`'s controlled shape).
 */
export function ProjectTabStrip({ projects, selectedSlug, onSelectSlug }: ProjectTabStripProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveTo = (index: number) => {
    const target = projects[index];
    if (!target) return;
    onSelectSlug(target.slug);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = projects.length;
    if (count === 0) return;

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveTo((index + 1) % count);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveTo((index - 1 + count) % count);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(count - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative w-full">
      <div
        role="tablist"
        aria-label="Projects"
        className="flex w-full flex-nowrap gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory"
      >
        {projects.map((project, index) => {
          const isSelected = project.slug === selectedSlug;
          const { tone } = projectPresentation(project.status);

          return (
            <button
              key={project.slug}
              type="button"
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              id={`project-tab-${project.slug}`}
              aria-selected={isSelected}
              aria-controls={`project-panel-${project.slug}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelectSlug(project.slug)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className="shrink-0 snap-start"
            >
              <TabPill selected={isSelected} className="gap-2">
                <StatusDot tone={tone} />
                {project.title}
              </TabPill>
            </button>
          );
        })}
      </div>
      {/* Peek/fade affordance: hints there's more content past the trailing
          edge instead of letting the row wrap at high browser zoom (FR-7). */}
      <div
        data-testid="project-tab-strip-fade"
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent"
      />
    </div>
  );
}
