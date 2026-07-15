import { useEffect, useState } from "react";

/**
 * Whole-document scroll progress in `[0, 1]`, for the mobile reading-progress
 * bar (`ScrollProgressBar`). Lifted from the ToC layout prototype
 * (`_prototype/TocPrototype.tsx`, deleted). SSR-safe: starts at `0` so server
 * and first client render agree, then reads (and subscribes to) scroll on
 * mount.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? el.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return progress;
}
