import { useEffect, useState } from "react";

/**
 * Track the `prefers-reduced-motion` user setting. Starts `false` so server and
 * first client render agree, then reads (and subscribes to) the media query on
 * mount - so an emulated or toggled preference is reflected deterministically.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}
