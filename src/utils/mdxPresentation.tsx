import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/Callout";
import { Diagram } from "@/components/Diagram";
import {
  Blockquote,
  ListItem,
  MdxImage,
  OrderedList,
  Pre,
  UnorderedList,
} from "./mdxPresentationBlock";
import { Anchor, heading, InlineCode, Paragraph } from "./mdxPresentationText";

/**
 * The single MDX → MUI presentation seam (FR-6). Every Post-body element is
 * re-rendered through an MUI component styled from `brand` tokens, so an `.mdx`
 * file never carries a raw hue or styling literal — visual treatment lives only
 * here. Code-block surfaces inherit the build-time `--shiki-*` palette (also
 * brand-sourced, ADR-0001); this seam owns everything around them.
 *
 * Security (FR-5, sec-external-link-rel): external anchors are hardened with
 * `rel="noopener noreferrer"` at the `a` mapping below. Active-content elements
 * a Post body must never embed — `<script>` and `<iframe>` — are mapped to
 * no-render neutralizers here, so the protection holds by leverage at the seam
 * rather than by author vigilance. MDX is trusted ONLY while 100% owner-authored
 * (CONTEXT.md, ADR-0001): admitting any external/PR-submitted MDX requires
 * `rehype-sanitize` + a CSP before merge.
 */

function NoScript(): null {
  return null;
}

function NoIframe(): null {
  return null;
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
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  blockquote: Blockquote,
  // Post-body images render through the single image seam. Diagrams now arrive
  // as pre-rendered SVGs via `<Diagram>` (see below), not inline Markdown images.
  img: MdxImage,
  // Active-content neutralizers: a Post body never embeds live third-party JS
  // or third-party frames (sec-external-link-rel).
  script: NoScript,
  iframe: NoIframe,
  // Owner-authored emphasized callout (trust boundary unchanged — owner-only).
  Callout,
  // Owner-authored pre-rendered Mermaid diagram (build-time SVG, no browser in
  // CI). Trust boundary unchanged — the SVG source is owner-authored .mmd.
  Diagram,
};
