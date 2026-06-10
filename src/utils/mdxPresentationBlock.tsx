import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { brand } from "@/theme/theme";
import { proseTextSx } from "./mdxPresentationText";

export function Pre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  // rehype-pretty-code already sets the --shiki-bg background + token colors on
  // the <pre>. This seam adds layout/overflow only: the block scrolls within
  // itself on narrow viewports, never introducing body-level scroll (FR-10).
  return (
    <Box
      component="pre"
      sx={{
        my: 3,
        p: 2,
        borderRadius: 2,
        overflowX: "auto",
        maxWidth: "100%",
        border: `1px solid ${brand.borderSubtle}`,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export function ListItem({ children, ...props }: { children?: ReactNode }) {
  return (
    <Typography component="li" variant="body1" sx={{ ...proseTextSx, my: 0.5 }} {...props}>
      {children}
    </Typography>
  );
}

export function UnorderedList({ children, ...props }: { children?: ReactNode }) {
  return (
    <Box component="ul" sx={{ pl: 3, my: 2, color: brand.slateLight }} {...props}>
      {children}
    </Box>
  );
}

export function OrderedList({ children, ...props }: { children?: ReactNode }) {
  return (
    <Box component="ol" sx={{ pl: 3, my: 2, color: brand.slateLight }} {...props}>
      {children}
    </Box>
  );
}
