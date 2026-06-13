/**
 * Shared layout tokens — the single home for cross-route spacing values, so the
 * same responsive numbers don't drift across page shells. Values are MUI
 * spacing-scale units (8px base). Brand *colors* live in `theme.ts`; *layout*
 * spacing lives here.
 */

/** Top/bottom padding shared by every top-level route Container (`/`, `/projects`, `/blog`). */
export const pageShellSx = { py: { xs: 4, md: 8 } } as const;
