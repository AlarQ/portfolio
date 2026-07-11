/**
 * The canonical Post category vocabulary (FR-5, OQ-4, ADR-RM-2).
 *
 * Product data only — canonical category NAMES, with no color/JSX/icons (those
 * live in the sibling `categoryPresentation` seam, per CLAUDE.md's "no
 * colors-as-literals in src/data"). `CATEGORY_NAMES` is the single source the
 * closed `CategoryName` union derives from, so a name mapped in the seam without
 * a matching entry here — or vice versa — is a TypeScript compile error, never a
 * silent runtime gap (matches the `BADGE_CATEGORIES` / `domains.ts` precedent).
 *
 * The loader (`buildPostSet`) validates frontmatter categories against this
 * vocabulary at the single gate: an unknown entry is warned + omitted while the
 * Post still publishes.
 *
 * Vocabulary derived (SF-3) from the existing Post's topics and the Figma badge
 * frame — a trivially reversible one-file edit. Adding a category = one entry
 * here + one hue in `categoryPresentation.tsx`.
 */
export const CATEGORY_NAMES = [
  "Leadership",
  "Management",
  "Presentation",
  "Engineering",
  "AI",
  "Workflow",
] as const;

export type CategoryName = (typeof CATEGORY_NAMES)[number];

/** Narrow an arbitrary string to a vocabulary `CategoryName` — the loader gate's membership check. */
export function isCategoryName(value: string): value is CategoryName {
  return (CATEGORY_NAMES as readonly string[]).includes(value);
}
