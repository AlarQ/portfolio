import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

// Turbopack requires rehype plugins as serializable [name, options] tuples
// (function references cannot cross the Rust loader boundary).
// Theme is a bundled Shiki theme for now; the brand-sourced `--shiki-*`
// CSS-var bridge (ADR-0001, FR-3) is a later task.
const withMDX = createMDX({
  options: {
    rehypePlugins: [["rehype-pretty-code", { theme: "github-dark" }]],
  },
});

export default withMDX(nextConfig);
