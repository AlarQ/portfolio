import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { TypographyProps } from "@mui/material/Typography";
import Typography from "@mui/material/Typography";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { brand, withAlpha } from "@/theme/theme";

export const proseTextSx = { color: brand.slateLight, lineHeight: 1.75 } as const;

/** Shared focus-visible outline for interactive prose elements (links, heading anchors). */
const focusVisibleOutlineSx = {
  outline: `2px solid ${brand.skyLight}`,
  outlineOffset: 2,
} as const;

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
  function Heading({ children, ...props }: { id?: string; children?: ReactNode }) {
    const { id } = props;
    return (
      <Typography
        component={tag}
        variant={HEADING_VARIANTS[tag]}
        sx={{
          color: brand.slateLight,
          fontWeight: 700,
          mt: 5,
          mb: 2,
          "&:hover .mdx-heading-anchor": { opacity: 1 },
        }}
        {...props}
      >
        {children}
        {id ? <HeadingAnchor href={`#${id}`} aria-label="Link to this section" /> : null}
      </Typography>
    );
  }
  Heading.displayName = `Mdx_${tag}`;
  return Heading;
}

/**
 * Hover/focus deep-link affordance for a heading with a rehype-slug id. Plain
 * `<a href="#id">` — no clipboard-copy handler, no interaction JS (binding
 * decision, task 001 Approach). Reuses the Anchor focus-visible outline
 * pattern via brand tokens only.
 */
function HeadingAnchor({ href, "aria-label": ariaLabel }: { href: string; "aria-label": string }) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="mdx-heading-anchor"
      sx={{
        // 44x44 MUST-minimum touch target without shifting the heading text:
        // pad the hit box, then pull it back with negative margin so the inline
        // line-height is preserved.
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 44,
        minHeight: 44,
        mx: 0.5,
        my: "-1rem",
        verticalAlign: "middle",
        color: brand.skyLight,
        opacity: 0,
        textDecoration: "none",
        "&:focus-visible": { opacity: 1, ...focusVisibleOutlineSx },
        // Coarse pointers can't hover, so keep the deep-link affordance visible.
        "@media (pointer: coarse)": { opacity: 1 },
      }}
    >
      #
    </Link>
  );
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
        "&:focus-visible": focusVisibleOutlineSx,
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
