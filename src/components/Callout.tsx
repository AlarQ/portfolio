import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { brand } from "@/theme/theme";

/**
 * Emphasized prose callout for Post bodies — a tinted, left-accented panel that
 * sets a "human gate" aside from the surrounding phase bullets. Presentation-only
 * and brand-sourced: the accent (left border), tint (subtle sky wash), and title
 * slot all derive from `brand` tokens, never raw hex (the seam rule in CLAUDE.md).
 * Styled to sit beside `Pre`/`MdxImage` in `mdxPresentationBlock` — same `my`,
 * `borderRadius`, and `brand.borderSubtle` border idiom.
 */
export function Callout({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <Box
      sx={{
        my: 3,
        p: 2,
        borderRadius: 2,
        bgcolor: brand.skyTint,
        border: `1px solid ${brand.borderSubtle}`,
        borderLeft: `4px solid ${brand.sky}`,
      }}
    >
      {title ? (
        <Typography
          component="p"
          variant="subtitle2"
          sx={{ color: brand.skyLight, fontWeight: 700, mb: 1 }}
        >
          {title}
        </Typography>
      ) : null}
      <Box sx={{ color: brand.slateLight, "& > :last-child": { mb: 0 } }}>{children}</Box>
    </Box>
  );
}
