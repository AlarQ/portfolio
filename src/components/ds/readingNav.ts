/**
 * Shared focus-visible ring for interactive links in the reading-surface `ds/`
 * navigation molecules (`TableOfContents`, `PrevNextNav`). It is shadcn's 3px
 * ring treatment bound to the semantic `ring` token; keeping one definition
 * makes the two nav components' keyboard-focus affordance identical and lets
 * the whole reading surface's focus style change in a single edit.
 */
export const READING_NAV_FOCUS_RING =
  "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";
