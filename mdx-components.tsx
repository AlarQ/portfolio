import type { MDXComponents } from "mdx/types";
import { mdxComponents } from "@/utils/mdxPresentation";

// Required by @next/mdx in the App Router. Every Post body renders through the
// single MDX→MUI presentation seam (`mdxComponents`, FR-6); caller-supplied
// components still win on collision so per-render overrides remain possible.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components };
}
