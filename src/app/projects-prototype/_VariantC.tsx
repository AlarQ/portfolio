"use client";

/**
 * PROTOTYPE — Variant C: "Tab strip". The master list collapses to a single
 * sticky, horizontally scrollable row of project pills; the brief renders
 * full-width beneath. On mobile the selector is one compact swipeable row (not
 * a tall stacked list), and because it's sticky, switching is always one tap
 * with no scroll-up-through-the-list.
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import { prototypeProjects, STATUS_META } from "./_fixtures";
import { ProjectBrief } from "./_shared";

export function VariantC() {
  const [activeSlug, setActiveSlug] = useState(prototypeProjects[0].slug);
  const active = prototypeProjects.find((p) => p.slug === activeSlug) ?? prototypeProjects[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="sticky top-0 z-10 -mx-6 bg-background/90 px-6 py-3 backdrop-blur">
        <div
          role="tablist"
          aria-label="Projects"
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
        >
          {prototypeProjects.map((p) => {
            const selected = p.slug === active.slug;
            const dot = STATUS_META[p.status].dot;
            return (
              <button
                key={p.slug}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveSlug(p.slug)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent/50"
                )}
              >
                <span
                  className={cn("size-1.5 rounded-full", selected ? "bg-primary-foreground" : dot)}
                  aria-hidden
                />
                {p.title}
              </button>
            );
          })}
        </div>
      </div>

      <article className="rounded-2xl border bg-card p-8">
        <ProjectBrief project={active} />
      </article>
    </div>
  );
}
