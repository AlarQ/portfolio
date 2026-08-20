"use client";
// PROTOTYPE (throwaway, branch prototype/d2-diagrams) - issue #116.
// Floating bar that flips the D2 look variant on the REAL pages that host the
// two prototyped diagrams. Sets `data-dvariant` on <html>; `Diagram` ships all
// variants and the CSS below shows one. Also mirrors to ?variant= so a view is
// shareable/reload-stable. Never rendered in production.
import { useCallback, useEffect, useState } from "react";

export const PROTOTYPE_VARIANTS = [
  { key: "a", name: "Tinted - today's palette" },
  { key: "b", name: "Ink - monochrome + one accent" },
  { key: "c", name: "Slab - no fills, 2px rules" },
  { key: "x", name: "Excalidraw (today, for comparison)" },
] as const;

export function PrototypeDiagramSwitcher() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("variant");
    const i = PROTOTYPE_VARIANTS.findIndex((v) => v.key === fromUrl);
    if (i >= 0) setIndex(i);
  }, []);

  useEffect(() => {
    const key = PROTOTYPE_VARIANTS[index].key;
    document.documentElement.setAttribute("data-dvariant", key);
    const url = new URL(window.location.href);
    url.searchParams.set("variant", key);
    window.history.replaceState(null, "", url);
  }, [index]);

  const step = useCallback((delta: number) => {
    setIndex((i) => (i + delta + PROTOTYPE_VARIANTS.length) % PROTOTYPE_VARIANTS.length);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  if (process.env.NODE_ENV === "production") return null;
  const current = PROTOTYPE_VARIANTS[index];

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black px-4 py-2 font-mono text-sm text-white shadow-lg">
      <button type="button" onClick={() => step(-1)} aria-label="Previous variant" className="px-2">
        ←
      </button>
      <span>
        {current.key.toUpperCase()} — {current.name}
      </span>
      <button type="button" onClick={() => step(1)} aria-label="Next variant" className="px-2">
        →
      </button>
    </div>
  );
}
