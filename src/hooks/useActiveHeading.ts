import { useEffect, useState } from "react";

/**
 * Scroll-spy: which heading (by DOM id) is currently in the reading zone.
 * Lifted from the ToC layout prototype (`_prototype/TocPrototype.tsx`,
 * deleted). SSR-safe: starts on the first id so server and first client
 * render agree, then observes in an effect keyed on the id list.
 *
 * `rootMargin` top offset is `-96px` to match `scroll-mt-24` (96px) used on
 * headings in `PostLayout` — one intended offset value, kept consistent
 * between the CSS scroll-anchor and the IntersectionObserver's "reading
 * zone" top edge (both cosmetic since the header isn't sticky).
 */
export function useActiveHeading(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const key = ids.join("|");

  useEffect(() => {
    const list = key ? key.split("|") : [];
    // Guards jsdom (unit tests have no IntersectionObserver) as well as any
    // environment that hasn't implemented it — scroll-spy is a progressive
    // enhancement, not a hard requirement (the first heading stays active).
    if (list.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );

    for (const id of list) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [key]);

  return active;
}
