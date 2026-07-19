import { cva } from "class-variance-authority";

/**
 * `StatusTone` - the closed tone union `status-dot` renders (FR-6, FR-10).
 * The `Status → StatusTone` mapping itself is a Task 003 seam concern
 * (`projectPresentation.tsx`); this atom only owns the tone → token binding.
 * Mirrors the `BadgeCategory`/`badgeCategoryVariants` precedent: the array is
 * the single source the closed union type is derived from, so a tone
 * referenced without a matching `toneVariants` entry is a compile error.
 *
 * - `muted` - de-emphasised (`exploring` Status, or any low-MVP Project - spec.md exploring-muted-tone)
 * - `info` - active/in-progress work
 * - `success` - shipped/complete work
 */
export const STATUS_TONES = ["muted", "info", "success"] as const;

export type StatusTone = (typeof STATUS_TONES)[number];

const toneVariants: Record<StatusTone, string> = {
  muted: "bg-muted-foreground",
  info: "bg-badge-sky-fg",
  success: "bg-badge-green-fg",
};

export const statusDotVariants = cva("inline-block size-2 shrink-0 rounded-full", {
  variants: { tone: toneVariants },
  defaultVariants: { tone: "muted" },
});
