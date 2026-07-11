import type { TocEntry } from "@/data/postToc";
import { READING_NAV_FOCUS_RING } from "./readingNav";

export interface TableOfContentsProps {
  readonly entries: readonly TocEntry[];
}

/**
 * Single source of truth for the ToC's accessible name — shared by this
 * component, its unit test, and the route-level e2e contract
 * (`e2e/blog-toc.spec.ts`) so the string can't drift between levels.
 */
export const TOC_ACCESSIBLE_NAME = "Table of contents";

/**
 * Presentational Table of Contents for a Post (FR-3). Renders the build-time
 * heading tree (`TocEntry[]`) as a `<nav>` of in-page anchors, each linking to
 * the `#id` the single heading seam (rehype-slug, task 001) already rendered —
 * it adds no second heading render path (sec-toc-single-render-seam).
 *
 * The accessible name is exactly `Table of contents`, the contract
 * `e2e/blog-toc.spec.ts` asserts. Page-agnostic and token-bound: semantic
 * Tailwind utilities only, no router, and no scroll-spy/sticky here (the route
 * owns jump/scroll/sticky behavior — task 004).
 */
export function TableOfContents({ entries }: TableOfContentsProps) {
  if (entries.length === 0) return null;

  return (
    <nav aria-label={TOC_ACCESSIBLE_NAME} className="flex flex-col gap-3">
      <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
        On this page
      </p>
      <ul className="flex flex-col gap-1">
        {entries.map((entry) => (
          <li key={entry.id} className={entry.depth === 3 ? "pl-4" : undefined}>
            <a
              href={`#${entry.id}`}
              className={`flex min-h-11 items-center border-l-2 border-transparent pl-3 text-sm leading-snug text-muted-foreground no-underline transition-colors hover:text-primary focus-visible:border-ring focus-visible:text-primary ${READING_NAV_FOCUS_RING}`}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
