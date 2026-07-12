"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
/**
 * PROTOTYPE — throwaway floating variant switcher. High-contrast pill, obviously
 * not part of the design under evaluation. Prev/label/next, ← → arrow keys
 * (ignored while typing in a field), URL `?variant=` so a pick is shareable and
 * reload-stable. Self-hides in production so a stray merge can't ship it.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export interface VariantDef {
  readonly key: string;
  readonly name: string;
}

export function PrototypeSwitcher({
  variants,
  current,
}: {
  variants: readonly VariantDef[];
  current: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current)
  );
  const active = variants[index];

  const go = useCallback(
    (dir: 1 | -1) => {
      const next = variants[(index + dir + variants.length) % variants.length];
      const sp = new URLSearchParams(params.toString());
      sp.set("variant", next.key);
      router.replace(`?${sp.toString()}`, { scroll: false });
    },
    [index, params, router, variants]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-1 rounded-full border border-border bg-foreground px-1.5 py-1.5 text-background shadow-lg">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous variant"
          className="grid size-8 place-items-center rounded-full hover:bg-background/20"
        >
          <ChevronLeftIcon className="size-4" />
        </button>
        <span className="min-w-44 px-2 text-center text-sm font-medium tabular-nums">
          {active.key} — {active.name}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next variant"
          className="grid size-8 place-items-center rounded-full hover:bg-background/20"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
