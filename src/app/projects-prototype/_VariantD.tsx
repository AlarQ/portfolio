"use client";

/**
 * PROTOTYPE — Variant D: "Split on desktop, sheet on mobile". Keeps exactly the
 * A layout on ≥md (list left, brief right). On phones the right panel is gone;
 * tapping a project slides its brief up in a bottom Sheet overlay, so the list
 * never gets buried above a long detail. Best-of-both if you like A's desktop
 * feel but want a focused mobile view.
 */
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { prototypeProjects } from "./_fixtures";
import { ProjectBrief, StatusPill } from "./_shared";

export function VariantD() {
  const [activeSlug, setActiveSlug] = useState(prototypeProjects[0].slug);
  const [sheetOpen, setSheetOpen] = useState(false);
  const active = prototypeProjects.find((p) => p.slug === activeSlug) ?? prototypeProjects[0];

  function pick(slug: string) {
    setActiveSlug(slug);
    // Only pop the sheet on small screens; on desktop the side panel updates.
    if (window.matchMedia("(max-width: 767px)").matches) setSheetOpen(true);
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <nav aria-label="Projects" className="flex flex-col gap-2 md:sticky md:top-8 md:self-start">
          {prototypeProjects.map((p) => {
            const selected = p.slug === active.slug;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => pick(p.slug)}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left transition-colors",
                  // active highlight is desktop-only; on mobile every row is a plain trigger
                  selected
                    ? "border-border bg-card hover:bg-accent/50 md:border-primary md:bg-accent"
                    : "border-border bg-card hover:bg-accent/50"
                )}
              >
                <span className="font-semibold text-foreground">{p.title}</span>
                <StatusPill status={p.status} />
              </button>
            );
          })}
        </nav>

        {/* Desktop-only side panel */}
        <article className="hidden rounded-2xl border bg-card p-8 md:block">
          <ProjectBrief project={active} />
        </article>
      </div>

      {/* Mobile-only detail */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] md:hidden">
          <SheetHeader>
            <SheetTitle className="text-xl">{active.title}</SheetTitle>
            <SheetDescription>{active.tagline}</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-8">
            <ProjectBrief project={active} showHeader={false} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
