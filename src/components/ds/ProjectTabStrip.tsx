"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRef } from "react";
import { TabPill } from "@/components/ui/tab-pill";
import type { Project } from "@/data/projects";

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
 * `TabPill` atom (visual selected state). Presentational: selection is fully
 * controlled by the caller via `selectedSlug`/`onSelectSlug` (mirrors
 * `Pagination`'s controlled shape).
 */
export function ProjectTabStrip({ projects, selectedSlug, onSelectSlug }: ProjectTabStripProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (dir: 1 | -1) => {
    railRef.current?.scrollBy({ left: dir * 160, behavior: "smooth" });
  };

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
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByAmount(-1)}
          className="shrink-0 rounded-full border border-border bg-background p-2 text-foreground shadow-sm md:hidden"
        >
          ‹
        </button>
        <div
          ref={railRef}
          role="tablist"
          aria-label="Projects"
          className="flex w-full flex-nowrap gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible md:snap-none"
        >
          {projects.map((project, index) => {
            const isSelected = project.slug === selectedSlug;

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
                  {project.title}
                </TabPill>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByAmount(1)}
          className="shrink-0 rounded-full border border-border bg-background p-2 text-foreground shadow-sm md:hidden"
        >
          ›
        </button>
      </div>
      <div className="mt-2 flex justify-center gap-1.5 md:hidden">
        {projects.map((project) => (
          <span
            key={project.slug}
            data-testid="project-tab-strip-dot"
            aria-hidden="true"
            className={
              project.slug === selectedSlug
                ? "h-1.5 w-4 rounded-pill bg-primary"
                : "h-1.5 w-1.5 rounded-pill bg-secondary"
            }
          />
        ))}
      </div>
    </div>
  );
}
