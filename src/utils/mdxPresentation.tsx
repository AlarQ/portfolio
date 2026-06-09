import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { TypographyProps } from "@mui/material/Typography";
import Typography from "@mui/material/Typography";
import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { brand, withAlpha } from "@/theme/theme";

/**
 * The single MDX → MUI presentation seam (FR-6). Every Post-body element is
 * re-rendered through an MUI component styled from `brand` tokens, so an `.mdx`
 * file never carries a raw hue or styling literal — visual treatment lives only
 * here. Code-block surfaces inherit the build-time `--shiki-*` palette (also
 * brand-sourced, ADR-0001); this seam owns everything around them.
 */

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** Heading element → MUI Typography variant. Body starts at h2 (h1 is the page title, FR-11). */
const HEADING_VARIANTS: Record<HeadingTag, TypographyProps["variant"]> = {
  h1: "h3",
  h2: "h4",
  h3: "h5",
  h4: "h6",
  h5: "subtitle1",
  h6: "subtitle2",
};

function heading(tag: HeadingTag) {
  function Heading({ children, ...props }: { children?: ReactNode }) {
    return (
      <Typography
        component={tag}
        variant={HEADING_VARIANTS[tag]}
        sx={{ color: brand.slateLight, fontWeight: 700, mt: 5, mb: 2 }}
        {...props}
      >
        {children}
      </Typography>
    );
  }
  Heading.displayName = `Mdx_${tag}`;
  return Heading;
}

function Paragraph({ children, ...props }: { children?: ReactNode }) {
  return (
    <Typography
      component="p"
      variant="body1"
      sx={{ color: brand.slateLight, lineHeight: 1.75, my: 2 }}
      {...props}
    >
      {children}
    </Typography>
  );
}

function Anchor({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  const isExternal = /^https?:\/\//.test(href);
  // External links are hardened (sec-external-link-rel): noopener noreferrer.
  const externalProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Link
      href={href}
      sx={{
        color: brand.skyLight,
        textDecorationColor: withAlpha(brand.sky, 0.4),
        "&:focus-visible": { outline: `2px solid ${brand.skyLight}`, outlineOffset: 2 },
      }}
      {...externalProps}
      {...props}
    >
      {children}
    </Link>
  );
}

function InlineCode({ children, ...props }: ComponentPropsWithoutRef<"code">) {
  // Block code (inside <pre>) is highlighted by rehype-pretty-code and carries
  // a `data-language` attribute — pass it through untouched so the --shiki-*
  // palette is preserved. Only inline code is restyled here.
  if ("data-language" in props) {
    return <code {...props}>{children}</code>;
  }
  return (
    <Box
      component="code"
      data-mdx-inline-code=""
      sx={{
        fontFamily: "var(--font-geist-mono), monospace",
        fontSize: "0.875em",
        color: brand.skyLighter,
        backgroundColor: withAlpha(brand.sky, 0.1),
        borderRadius: 1,
        px: 0.75,
        py: 0.25,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

function Pre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
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

function listItem({ children, ...props }: { children?: ReactNode }) {
  return (
    <Typography
      component="li"
      variant="body1"
      sx={{ color: brand.slateLight, lineHeight: 1.75, my: 0.5 }}
      {...props}
    >
      {children}
    </Typography>
  );
}

function unorderedList({ children, ...props }: { children?: ReactNode }) {
  return (
    <Box component="ul" sx={{ pl: 3, my: 2, color: brand.slateLight }} {...props}>
      {children}
    </Box>
  );
}

function orderedList({ children, ...props }: { children?: ReactNode }) {
  return (
    <Box component="ol" sx={{ pl: 3, my: 2, color: brand.slateLight }} {...props}>
      {children}
    </Box>
  );
}

/**
 * The exhaustive Post-body element map. `mdx-components.tsx` spreads this into
 * the App Router `useMDXComponents` hook so every Post renders through it.
 */
export const mdxComponents: MDXComponents = {
  h1: heading("h1"),
  h2: heading("h2"),
  h3: heading("h3"),
  h4: heading("h4"),
  h5: heading("h5"),
  h6: heading("h6"),
  p: Paragraph,
  a: Anchor,
  code: InlineCode,
  pre: Pre,
  ul: unorderedList,
  ol: orderedList,
  li: listItem,
};
