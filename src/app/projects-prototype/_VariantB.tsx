"use client";

/**
 * PROTOTYPE — Variant B: "Accordion". One full-width list; tapping a row expands
 * the brief inline directly beneath it (one open at a time). Fixes A's mobile
 * flaw head-on — the content appears *where you tapped*, never dumped at the
 * bottom — and behaves identically on phone and desktop.
 */
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { prototypeProjects } from "./_fixtures";
import { MvpProgress, ProjectBrief, StatusPill } from "./_shared";

export function VariantB() {
  const [openSlug, setOpenSlug] = useState<string | null>(prototypeProjects[0].slug);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
      {prototypeProjects.map((p) => {
        const open = openSlug === p.slug;
        return (
          <div key={p.slug} className="overflow-hidden rounded-xl border bg-card">
            <button
              type="button"
              onClick={() => setOpenSlug(open ? null : p.slug)}
              aria-expanded={open}
              className="flex w-full flex-col gap-2 px-4 py-4 text-left transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <span className="flex-1 font-semibold text-foreground">{p.title}</span>
                <StatusPill status={p.status} />
                <ChevronDownIcon
                  className={cn(
                    "size-5 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180"
                  )}
                />
              </div>
              {!open && <MvpProgress value={p.mvpProgress} />}
            </button>

            {open && (
              <div className="border-t px-4 py-6">
                <ProjectBrief project={p} showHeader={false} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
