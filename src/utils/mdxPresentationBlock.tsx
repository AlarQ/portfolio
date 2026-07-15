import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared "framed-image" visual language: centered, column-scaled, token-framed
 * (`rounded-lg border border-border p-4`). Consumed by `MdxImage` here and by
 * `<Diagram>`'s `<figure>` — each appending its own extras — so a border/padding
 * tweak is made in ONE place.
 */
export const MDX_FRAME_CLASS = "mx-auto my-6 max-w-full rounded-lg border border-border p-4";

export function Pre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  // rehype-pretty-code already sets the --shiki-bg background + token colors on
  // the <pre>. This seam adds layout/overflow only: the block scrolls within
  // itself on narrow viewports, never introducing body-level scroll (FR-10).
  return (
    <pre className="my-6 max-w-full overflow-x-auto rounded-lg border border-border p-4" {...props}>
      {children}
    </pre>
  );
}

export function MdxImage({ alt, ...props }: ComponentPropsWithoutRef<"img">) {
  // Styles literal `![]()` markdown images in a Post body: centered, scaled to
  // the column, token-framed. This seam owns the layout for those raw images,
  // and `alt` is kept so they stay accessible. `<Diagram>` intentionally does
  // NOT route through here — it owns its own `<figure>` frame because it renders
  // a light/dark SVG pair (`/diagrams/<name>-{light,dark}.svg`) rather than a
  // single image.
  return (
    // biome-ignore lint/performance/noImgElement: pre-rendered Mermaid SVG from the MDX body, not an app-rendered image
    <img alt={alt ?? ""} className={cn(MDX_FRAME_CLASS, "block h-auto")} {...props} />
  );
}

export function Blockquote({ children, ...props }: ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      className="my-6 border-l-4 border-border pl-4 italic text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function ListItem({ children, ...props }: { children?: ReactNode }) {
  return (
    <li className="my-1 text-lg leading-[1.7] text-muted-foreground" {...props}>
      {children}
    </li>
  );
}

export function UnorderedList({ children, ...props }: { children?: ReactNode }) {
  return (
    <ul className="my-4 list-disc pl-6 text-muted-foreground" {...props}>
      {children}
    </ul>
  );
}

export function OrderedList({ children, ...props }: { children?: ReactNode }) {
  return (
    <ol className="my-4 list-decimal pl-6 text-muted-foreground" {...props}>
      {children}
    </ol>
  );
}
