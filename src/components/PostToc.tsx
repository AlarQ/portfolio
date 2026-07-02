"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useEffect, useState } from "react";
import type { TocEntry } from "@/data/postToc";
import { brand } from "@/theme/theme";

interface PostTocProps {
  readonly entries: readonly TocEntry[];
}

/**
 * Sticky desktop Table of Contents for a Post (FR-1). Consumes the build-time
 * heading tree (`TocEntry[]`) and links each entry to the `#id` the single
 * heading seam (task 001, rehype-slug) already rendered — it adds NO second
 * heading render path (sec-toc-single-render-seam).
 *
 * Client seam only for the scroll-spy: an `IntersectionObserver` (no scroll
 * listener) highlights the section currently in view. Anchor jumps stay native
 * and instant — no smooth-scroll — so the reduced-motion preference is honored
 * by construction (there is no motion to suppress).
 *
 * Hidden below `md`: a ~34-char mobile measure has no room for a sidebar, so
 * readers scroll linearly (decision 5). The reveal is `display` only.
 */
export function PostToc({ entries }: PostTocProps) {
  const activeId = useActiveHeading(entries);

  if (entries.length === 0) return null;

  return (
    <Box
      component="nav"
      aria-label="Table of contents"
      sx={{
        display: { xs: "none", md: "block" },
        position: "sticky",
        top: 112,
        maxHeight: "calc(100vh - 136px)",
        overflowY: "auto",
        maxWidth: "16rem",
        ml: 4,
      }}
    >
      <Box
        component="p"
        sx={{
          m: 0,
          mb: 1.5,
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: brand.slate,
        }}
      >
        On this page
      </Box>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {entries.map((entry) => {
          const isActive = entry.id === activeId;
          return (
            <Box component="li" key={entry.id} sx={{ pl: entry.depth === 3 ? 2 : 0 }}>
              <Link
                href={`#${entry.id}`}
                aria-current={isActive ? "location" : undefined}
                sx={{
                  display: "block",
                  py: 0.5,
                  fontSize: "0.875rem",
                  lineHeight: 1.4,
                  textDecoration: "none",
                  color: isActive ? brand.skyLight : brand.slateLight,
                  borderLeft: "2px solid",
                  borderColor: isActive ? brand.skyLight : "transparent",
                  pl: 1.5,
                  transition: "color 150ms ease-out, border-color 150ms ease-out",
                  "&:hover": { color: brand.skyLighter },
                  "&:focus-visible": {
                    outline: `2px solid ${brand.skyLight}`,
                    outlineOffset: 2,
                  },
                }}
              >
                {entry.text}
              </Link>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/**
 * Track which heading section is currently in view via one `IntersectionObserver`
 * over the rendered heading elements — no scroll listener, no layout thrash.
 * Returns the active heading id (or `""` before any intersection).
 */
function useActiveHeading(entries: readonly TocEntry[]): string {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed.find((record) => record.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px" }
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [entries]);

  return activeId;
}
