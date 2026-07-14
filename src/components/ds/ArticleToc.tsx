"use client";

import { useMemo } from "react";
import type { TocEntry } from "@/data/postToc";
import { useActiveHeading } from "@/hooks/useActiveHeading";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { ScrollProgressBar } from "./ScrollProgressBar";
import { TableOfContents } from "./TableOfContents";

export interface ArticleTocProps {
  readonly entries: readonly TocEntry[];
}

/**
 * `"use client"` organism owning a Post's ToC *behavior* (blog-readability
 * Decisions 5-7): scroll-spy (`useActiveHeading`), mobile scroll progress
 * (`useScrollProgress`), and reduced-motion (`usePrefersReducedMotion`) — one
 * `reducedMotion` boolean threaded once, not re-read per child. Renders the
 * presentational `TableOfContents` dot-rail (desktop, `md:flex`) and the
 * presentational `ScrollProgressBar` (mobile, `md:hidden`); the two are
 * mutually exclusive by breakpoint, never shown together.
 *
 * `PostLayout` mounts this directly as a split-column flex child. This
 * component owns its own desktop rail styling (`hidden md:flex md:sticky
 * md:top-1/2 md:-translate-y-1/2 md:h-fit md:w-72 md:shrink-0` — sticky with a
 * 50% top offset so the rail centers on the viewport height rather than
 * pinning to the top, mirroring `IdentityRail.tsx:71` otherwise) rather than a
 * wrapping `PostLayout` `<div>`, because the mobile `ScrollProgressBar` is
 * `fixed` and must NOT sit inside a `hidden`-below-`md` ancestor — a
 * `display: none` ancestor hides fixed-positioned descendants too, which
 * would silently kill the mobile progress bar.
 */
export function ArticleToc({ entries }: ArticleTocProps) {
  const ids = useMemo(
    () => entries.filter((entry) => entry.depth === 2).map((entry) => entry.id),
    [entries]
  );
  const activeId = useActiveHeading(ids);
  const progress = useScrollProgress();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <>
      <div className="hidden md:sticky md:top-1/2 md:flex md:h-fit md:w-72 md:shrink-0 md:-translate-y-1/2">
        <TableOfContents entries={entries} activeId={activeId} />
      </div>
      <ScrollProgressBar progress={progress} reducedMotion={reducedMotion} />
    </>
  );
}
