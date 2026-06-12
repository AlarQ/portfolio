import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { TypographyProps } from "@mui/material/Typography";
import Typography from "@mui/material/Typography";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { brand, withAlpha } from "@/theme/theme";

export const proseTextSx = { color: brand.slateLight, lineHeight: 1.75 } as const;

const SAFE_HREF = /^(https?:\/\/|\/|#|mailto:)/i;

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** Heading element → MUI Typography variant. Body starts at h2 (h1 is the page title, FR-11). */
export const HEADING_VARIANTS: Record<HeadingTag, TypographyProps["variant"]> = {
  h1: "h3",
  h2: "h4",
  h3: "h5",
  h4: "h6",
  h5: "subtitle1",
  h6: "subtitle2",
};

export function heading(tag: HeadingTag) {
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

export function Paragraph({ children, ...props }: { children?: ReactNode }) {
  return (
    <Typography component="p" variant="body1" sx={{ ...proseTextSx, my: 2 }} {...props}>
      {children}
    </Typography>
  );
}

export function Anchor({
  href = "",
  children,
  onClick: _onClick,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  const safeHref = SAFE_HREF.test(href) ? href : "#";
  const isExternal = /^https?:\/\//i.test(safeHref);
  // External links are hardened (sec-external-link-rel): noopener noreferrer.
  // externalProps is spread AFTER caller props so callers cannot clobber rel/target.
  const externalProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Link
      href={safeHref}
      sx={{
        color: brand.skyLight,
        textDecorationColor: withAlpha(brand.sky, 0.4),
        "&:focus-visible": { outline: `2px solid ${brand.skyLight}`, outlineOffset: 2 },
      }}
      {...props}
      {...externalProps}
    >
      {children}
    </Link>
  );
}

export function InlineCode({
  children,
  onClick: _onClick,
  ...props
}: ComponentPropsWithoutRef<"code">) {
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
