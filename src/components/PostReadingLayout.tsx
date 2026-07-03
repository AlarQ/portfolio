import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { PostArticle } from "@/components/PostArticle";
import { PostNav } from "@/components/PostNav";
import { PostToc } from "@/components/PostToc";
import type { PostAdjacency } from "@/data/postLoader";
import type { TocEntry } from "@/data/postToc";
import { proseMeasure } from "@/theme/theme";

interface PostReadingLayoutProps {
  readonly title: string;
  readonly toc: readonly TocEntry[];
  readonly adjacency: PostAdjacency;
  readonly children: ReactNode;
}

/**
 * The Post reading scaffold — a leftover-margin grid `[gutter | centered
 * proseMeasure prose | ToC]`. The prose column is fixed at the reading measure
 * and stays centered in the viewport; the sticky ToC occupies the right gutter
 * and never shrinks the reading column below the measure. Below `md` the grid
 * collapses to one column and the ToC hides itself (toc-hidden-mobile), so the
 * prose spans the full width.
 *
 * Owns the prose↔ToC layout coupling (they share `proseMeasure`) in one module
 * so the route only loads data and hands off `{ title, toc, body }`.
 */
export function PostReadingLayout({ title, toc, adjacency, children }: PostReadingLayoutProps) {
  return (
    <Box
      sx={{
        display: "grid",
        // Cells stretch to the (tall) prose row so the sticky ToC has travel room.
        gridTemplateColumns: { xs: "1fr", md: `1fr minmax(0, ${proseMeasure}) 1fr` },
      }}
    >
      <Box sx={{ gridColumn: { md: "2" }, minWidth: 0 }}>
        <PostArticle title={title}>{children}</PostArticle>
        <Box sx={{ maxWidth: proseMeasure, mx: "auto", px: { xs: 3, md: 0 } }}>
          <PostNav prev={adjacency.prev} next={adjacency.next} />
        </Box>
      </Box>
      <Box sx={{ gridColumn: { md: "3" }, minWidth: 0 }}>
        <PostToc entries={toc} />
      </Box>
    </Box>
  );
}
