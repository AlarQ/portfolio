import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type PageItem = number | "ellipsis";

/**
 * Pure helper: build the ordered list of page tokens shown in the control.
 * The first and last `boundaryCount` pages always show, plus a window of
 * `siblingCount` pages around the current page; any run of hidden pages
 * collapses to a single `"ellipsis"` token. Presentational only - no routing.
 * At `currentPage=1, totalPages=10` this yields `1 2 3 … 8 9 10`, matching
 * Figma 614:383.
 */
export function buildPageItems(
  currentPage: number,
  totalPages: number,
  boundaryCount = 3,
  siblingCount = 1
): readonly PageItem[] {
  if (totalPages <= 0) return [];
  const current = Math.min(Math.max(currentPage, 1), totalPages);

  const pages = new Set<number>();
  for (let p = 1; p <= Math.min(boundaryCount, totalPages); p++) pages.add(p);
  for (let p = Math.max(totalPages - boundaryCount + 1, 1); p <= totalPages; p++) pages.add(p);
  for (
    let p = Math.max(current - siblingCount, 1);
    p <= Math.min(current + siblingCount, totalPages);
    p++
  ) {
    pages.add(p);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: PageItem[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (page - previous > 1) items.push("ellipsis");
    items.push(page);
    previous = page;
  }
  return items;
}

export interface PaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
}

/**
 * Bespoke molecule for the blog index pagination row (Previous · numbered
 * pages with `…` truncation · Next), matching Figma 614:383. Presentational
 * only - no routing wiring (same precedent as `ThemePill`/`Newsletter`); the
 * page buttons are inert placeholders until a route owns navigation. Binds
 * only to semantic Tailwind classes - no raw hex/palette lookups
 * (`no-direct-palette-import`).
 */
export function Pagination({ currentPage, totalPages }: PaginationProps) {
  // Clamp once so an out-of-range `currentPage` still marks a page active,
  // matching `buildPageItems`' own clamp (a raw compare below would otherwise
  // leave the control with nothing selected).
  const current = Math.min(Math.max(currentPage, 1), totalPages);
  const items = buildPageItems(current, totalPages);
  const isFirst = current <= 1;
  const isLast = current >= totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-border pt-5 text-foreground"
    >
      <button
        type="button"
        disabled={isFirst}
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <ArrowLeftIcon className="size-5" aria-hidden />
        Previous
      </button>

      <ul className="hidden items-center gap-0.5 sm:flex">
        {items.map((item, index) =>
          item === "ellipsis" ? (
            // Keyed by the preceding page (always a number before a gap), so
            // the two possible ellipses stay stable across renders.
            <li
              key={`gap-after-${items[index - 1]}`}
              aria-hidden
              className="flex size-10 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-current={item === current ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  "flex size-10 items-center justify-center rounded-md text-sm font-medium",
                  item === current
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item}
              </button>
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        disabled={isLast}
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        Next
        <ArrowRightIcon className="size-5" aria-hidden />
      </button>
    </nav>
  );
}
