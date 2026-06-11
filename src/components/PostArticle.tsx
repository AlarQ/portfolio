"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import { brand } from "@/theme/theme";

/**
 * Track the `prefers-reduced-motion` user setting. Starts `false` so server and
 * first client render agree, then reads (and subscribes to) the media query on
 * mount — so an emulated or toggled preference is reflected deterministically.
 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

interface PostArticleProps {
  readonly title: string;
  readonly children: ReactNode;
}

/**
 * The long-form reading frame for a Post detail page (FR-10/FR-11). Owns the
 * three things the bare MDX body cannot:
 *  - the single page `<h1>` (the Post title), so the body's `##` heading is the
 *    first `h2` and the heading tree never skips a level;
 *  - a constrained measure (~68ch, centered) for credible long-form prose;
 *  - an entrance motion that `prefers-reduced-motion` suppresses — surfaced as
 *    `data-reduced-motion` so the behavior is deterministically observable.
 */
export function PostArticle({ title, children }: PostArticleProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <Box
      component={motion.article}
      data-reduced-motion={reduced ? "true" : "false"}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      sx={{
        maxWidth: "68ch",
        mx: "auto",
        px: { xs: 3, md: 0 },
      }}
    >
      <Typography
        component="h1"
        variant="h2"
        sx={{ color: brand.white, fontWeight: 800, mb: 4, lineHeight: 1.15 }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}
