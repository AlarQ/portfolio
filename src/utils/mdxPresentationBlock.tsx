import type { ComponentPropsWithoutRef, ReactNode } from "react";

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
  // The only images in a Post body today are pre-rendered Mermaid diagrams,
  // referenced by `<Diagram>` as static `/diagrams/*.svg` files (rendered at
  // commit time, not during `next build`). This seam owns their layout:
  // centered, scaled to the column, token-framed. `alt` is kept so the diagram
  // stays accessible.
  return (
    // biome-ignore lint/performance/noImgElement: pre-rendered Mermaid SVG from the MDX body, not an app-rendered image
    <img
      alt={alt ?? ""}
      className="mx-auto my-6 block h-auto max-w-full rounded-lg border border-border p-4"
      {...props}
    />
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
