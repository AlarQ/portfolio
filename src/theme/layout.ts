/**
 * Shared layout tokens — the single home for cross-route spacing values, so the
 * same responsive numbers don't drift across page shells. Values are MUI
 * spacing-scale units (8px base). Brand *colors* live in `theme.ts`; *layout*
 * spacing lives here.
 */

/** Top/bottom padding shared by every top-level route Container (`/blog`; also the unreachable `/` shell). */
export const pageShellSx = { py: { xs: 4, md: 8 } } as const;

/** The centered page `<h1>` title scale, used by `/blog` (FR-11). */
export const pageTitleSx = {
  fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
  fontWeight: 700,
  mb: { xs: 3, md: 5 },
  textAlign: "center",
} as const;
