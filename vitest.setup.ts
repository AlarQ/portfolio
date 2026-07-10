// jsdom has no `matchMedia` implementation. `usePrefersReducedMotion`
// (src/hooks/usePrefersReducedMotion.ts) calls it on mount, and it is now
// consumed broadly via `ds/ArticleProse` (task 005, reduced-motion-respected),
// so the polyfill lives here once for every test file rather than being
// duplicated per-suite (see the pre-existing local copy in
// `theme/ThemeProvider.test.tsx`, guarded so it no-ops once this runs first).
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
