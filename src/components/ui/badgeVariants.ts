import { cva } from "class-variance-authority";

/**
 * The Badge category taxonomy (FR-6) - the shadcn analogue of
 * `skillPresentation`'s exhaustive `Record<IconKey, …>`. Each hue is decorative
 * (none tied to a category *name*); `BADGE_CATEGORIES` is the single source the
 * closed union type is derived from, so a category referenced here without a
 * matching `categoryVariants` entry is a TypeScript compile error, never a
 * silent runtime fallback.
 */
export const BADGE_CATEGORIES = [
  "violet",
  "indigo",
  "pink",
  "sky",
  "green",
  "gray-blue",
  "orange",
  "rose",
] as const;

export type BadgeCategory = (typeof BADGE_CATEGORIES)[number];

const categoryVariants: Record<BadgeCategory, string> = {
  violet: "bg-badge-violet-bg text-badge-violet-fg",
  indigo: "bg-badge-indigo-bg text-badge-indigo-fg",
  pink: "bg-badge-pink-bg text-badge-pink-fg",
  sky: "bg-badge-sky-bg text-badge-sky-fg",
  green: "bg-badge-green-bg text-badge-green-fg",
  "gray-blue": "bg-badge-gray-blue-bg text-badge-gray-blue-fg",
  orange: "bg-badge-orange-bg text-badge-orange-fg",
  rose: "bg-badge-rose-bg text-badge-rose-fg",
};

export const badgeCategoryVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-sm leading-5 font-medium whitespace-nowrap",
  {
    variants: { category: categoryVariants },
    defaultVariants: { category: "gray-blue" },
  }
);
