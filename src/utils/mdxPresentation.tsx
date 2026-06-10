import type { MDXComponents } from "mdx/types";
import { ListItem, OrderedList, Pre, UnorderedList } from "./mdxPresentationBlock";
import { Anchor, heading, InlineCode, Paragraph } from "./mdxPresentationText";

/**
 * The single MDX → MUI presentation seam (FR-6). Every Post-body element is
 * re-rendered through an MUI component styled from `brand` tokens, so an `.mdx`
 * file never carries a raw hue or styling literal — visual treatment lives only
 * here. Code-block surfaces inherit the build-time `--shiki-*` palette (also
 * brand-sourced, ADR-0001); this seam owns everything around them.
 */

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
};
