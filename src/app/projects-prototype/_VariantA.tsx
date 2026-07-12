"use client";

/**
 * PROTOTYPE — Variant A: "Split" (desktop-first reference). Sticky list left,
 * brief swaps on the right. The chosen direction — but it stacks poorly on
 * mobile (whole list on top, content far below). Kept as the baseline; B/C/D
 * are the mobile-friendly takes on the same master–detail idea.
 */
import { useState } from "react";
import { cn } from "@/lib/utils";
import { prototypeProjects } from "./_fixtures";
import { ProjectBrief, StatusPill } from "./_shared";

export function VariantA() {
  const [activeSlug, setActiveSlug] = useState(prototypeProjects[0].slug);
  const active = prototypeProjects.find((p) => p.slug === activeSlug) ?? prototypeProjects[0];

  return (
    <div className="grid gap-8 md:grid-cols-[300px_1fr]">
      <nav aria-label="Projects" className="flex flex-col gap-2 md:sticky md:top-8 md:self-start">
        {prototypeProjects.map((p) => {
          const selected = p.slug === active.slug;
          return (
            <button
              key={p.slug}
              type="button"
              onClick={() => setActiveSlug(p.slug)}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "flex flex-col gap-2 rounded-xl border px-4 py-3 text-left transition-colors",
                selected ? "border-primary bg-accent" : "border-border bg-card hover:bg-accent/50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{p.title}</span>
                <StatusPill status={p.status} />
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${p.mvpProgress}%` }}
                />
              </div>
            </button>
          );
        })}
      </nav>

      <article className="rounded-2xl border bg-card p-8">
        <ProjectBrief project={active} />
      </article>
    </div>
  );
}
