import type { ReactNode } from "react";

/**
 * Emphasized prose callout for Post bodies - a tinted, left-accented panel that
 * sets a "human gate" aside from the surrounding phase bullets. Presentation-only
 * and token-bound: the accent (left border), tint (`bg-muted` wash), and title
 * slot all resolve through semantic Tailwind utilities, never a raw hex or
 * styling literal (the seam token rule in CLAUDE.md). Styled to sit beside `Pre`/`MdxImage`
 * in `mdxPresentationBlock` - same `my`, radius, and `border-border` idiom.
 */
export function Callout({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="my-6 rounded-lg border border-border border-l-4 border-l-primary bg-muted p-4">
      {title ? <p className="mb-2 text-sm font-bold text-primary">{title}</p> : null}
      <div className="text-muted-foreground [&>:last-child]:mb-0">{children}</div>
    </div>
  );
}
