// PROTOTYPE - throwaway (wayfinder #96). Floating variant switcher; dev-only.
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export interface PrototypeSwitcherProps {
  readonly variants: readonly { readonly key: string; readonly name: string }[];
  readonly current: string;
}

export function PrototypeSwitcher({ variants, current }: PrototypeSwitcherProps) {
  const router = useRouter();
  const params = useSearchParams();
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current)
  );

  const go = (delta: number) => {
    const next = variants[(index + delta + variants.length) % variants.length];
    const search = new URLSearchParams(params?.toString());
    search.set("variant", next.key);
    router.replace(`/projects?${search.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (/^(INPUT|TEXTAREA)$/.test(target.tagName) || target.isContentEditable)) return;
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-pill border border-border bg-foreground px-4 py-2 text-background shadow-lg">
      <button type="button" onClick={() => go(-1)} aria-label="Previous variant">
        ←
      </button>
      <span className="font-mono text-sm">
        {variants[index].key} — {variants[index].name}
      </span>
      <button type="button" onClick={() => go(1)} aria-label="Next variant">
        →
      </button>
    </div>
  );
}
