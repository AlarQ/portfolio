import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * The Post-body reading font size. `PostLayout`'s `ch`-based grid measure
 * anchors its column font-size to this exact value so the prose column is 64
 * characters of the actual body text; the paragraph seam below renders the same
 * size via the `text-lg` utility.
 */
export const proseReadingFontSize = "1.125rem";

const SAFE_HREF = /^(https?:\/\/|\/|#|mailto:)/i;

/** Shared focus-visible outline for interactive prose elements (links, heading anchors). */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Shared visual style for inline prose text links (MDX body, privacy-policy hint, …). */
export const PROSE_LINK_CLASS = `text-primary underline decoration-primary/40 underline-offset-2 ${FOCUS_RING}`;

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** Heading element → semantic size utility. Body starts at h2 (h1 is the page title, FR-11). */
const HEADING_SIZES: Record<HeadingTag, string> = {
  h1: "text-3xl",
  h2: "text-2xl",
  h3: "text-xl",
  h4: "text-lg",
  h5: "text-base",
  h6: "text-sm",
};

export function heading(tag: HeadingTag) {
  function Heading({ children, ...props }: { id?: string; children?: ReactNode }) {
    const { id } = props;
    const Tag = tag;
    return (
      <Tag className={`group font-bold text-foreground ${HEADING_SIZES[tag]}`} {...props}>
        {children}
        {id ? <HeadingAnchor href={`#${id}`} aria-label="Link to this section" /> : null}
      </Tag>
    );
  }
  Heading.displayName = `Mdx_${tag}`;
  return Heading;
}

/**
 * Hover/focus deep-link affordance for a heading with a rehype-slug id. Plain
 * `<a href="#id">` - no clipboard-copy handler, no interaction JS (binding
 * decision, task 001 Approach). The 44×44 touch target is padded then pulled
 * back with negative margin so the inline heading line-height is preserved.
 * Revealed on group hover/focus; kept visible on coarse pointers (no hover).
 */
function HeadingAnchor({ href, "aria-label": ariaLabel }: { href: string; "aria-label": string }) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`mx-1 -my-4 inline-flex min-h-11 min-w-11 items-center justify-center align-middle text-primary no-underline opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 [@media(pointer:coarse)]:opacity-100 ${FOCUS_RING}`}
    >
      #
    </a>
  );
}

export function Paragraph({ children, ...props }: { children?: ReactNode }) {
  return (
    <p className="text-lg leading-[1.7] text-muted-foreground" {...props}>
      {children}
    </p>
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
    <a href={safeHref} className={PROSE_LINK_CLASS} {...props} {...externalProps}>
      {children}
    </a>
  );
}

export function InlineCode({
  children,
  onClick: _onClick,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  // Block code (inside <pre>) is highlighted by rehype-pretty-code and carries
  // a `data-language` attribute - pass it through untouched so the --shiki-*
  // palette is preserved. Only inline code is restyled here.
  if ("data-language" in props) {
    return <code {...props}>{children}</code>;
  }
  return (
    <code
      data-mdx-inline-code=""
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-primary"
      {...props}
    >
      {children}
    </code>
  );
}
