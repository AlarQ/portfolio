import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Track the `prefers-reduced-motion` user setting via `useSyncExternalStore`,
 * so the client subscribes directly to the media query's live value instead
 * of a `useState`+`useEffect` copy that can go stale between renders.
 * `serverSnapshot` (default `false`) is returned during SSR/hydration so the
 * server and first client render agree - callers that need "no motion until
 * proven otherwise" (e.g. `ClipRow`) pass `true` explicitly.
 */
export function usePrefersReducedMotion(serverSnapshot = false): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}
