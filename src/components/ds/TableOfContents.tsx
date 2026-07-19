import type { TocEntry } from "@/data/postToc";
import { cn } from "@/lib/utils";
import { READING_NAV_FOCUS_RING } from "./readingNav";

export interface TableOfContentsProps {
  readonly entries: readonly TocEntry[];
  /** The scroll-spy-active heading id, owned by the client organism (`ArticleToc`). */
  readonly activeId?: string | null;
}

/**
 * Single source of truth for the ToC's accessible name - shared by this
 * component, its unit test, and the route-level e2e contract
 * (`e2e/blog-toc.spec.ts`) so the string can't drift between levels.
 */
export const TOC_ACCESSIBLE_NAME = "Table of contents";

/**
 * Presentational Table of Contents for a Post (FR-1), rendered as a left
 * dot-rail (blog-readability Decision 6, prototype variant C): each chapter's
 * name stays hidden until its dot is hovered, keyboard-focused, or is the
 * scroll-spy-active section (`activeId`). Renders the build-time heading tree
 * (`TocEntry[]`) as a `<nav>` of in-page anchors, each linking to the `#id`
 * the single heading seam (rehype-slug, task 001) already rendered - it adds
 * no second heading render path (sec-toc-single-render-seam).
 *
 * The accessible name is exactly `Table of contents`, the contract
 * `e2e/blog-toc.spec.ts` asserts. Page-agnostic and token-bound: semantic
 * Tailwind utilities only, no router, and no scroll-spy/sticky here (the
 * client organism, `ArticleToc`, owns scroll-spy/progress/sticky - this
 * component only renders what it's told).
 *
 * Rail shows top-level (`##`, depth 2) sections only - `###` subsections are
 * dropped here, not in the data layer, so `postToc.ts` still carries the full
 * tree for any future consumer that wants it.
 */
export function TableOfContents({ entries, activeId = null }: TableOfContentsProps) {
  const topLevelEntries = entries.filter((entry) => entry.depth === 2);
  if (topLevelEntries.length === 0) return null;

  return (
    <nav aria-label={TOC_ACCESSIBLE_NAME} className="flex flex-col gap-1">
      <p className="sr-only">On this page</p>
      {topLevelEntries.map((entry) => {
        const isActive = activeId === entry.id;
        return (
          <a
            key={entry.id}
            href={`#${entry.id}`}
            aria-current={isActive ? "location" : undefined}
            className={cn("group flex items-center gap-2 py-1", READING_NAV_FOCUS_RING)}
          >
            <span
              className={cn(
                "h-0.5 shrink-0 rounded-full transition-all",
                isActive
                  ? "w-6 bg-primary"
                  : "w-3 bg-border group-hover:w-5 group-hover:bg-muted-foreground group-focus-visible:w-5 group-focus-visible:bg-muted-foreground"
              )}
            />
            <span
              className={cn(
                "max-w-0 overflow-hidden text-xs whitespace-nowrap opacity-0 transition-all",
                "group-hover:max-w-[12rem] group-hover:opacity-100 group-focus-visible:max-w-[12rem] group-focus-visible:opacity-100",
                isActive && "max-w-[12rem] text-primary opacity-100"
              )}
            >
              {entry.text}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
