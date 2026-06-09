import type { MDXComponents } from "mdx/types";

// Required by @next/mdx in the App Router. The full MDX→MUI presentation seam
// (FR-6) is a later task; for this slice MDX elements render as their default
// HTML elements.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return components;
}
