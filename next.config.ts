import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

// Turbopack requires rehype plugins as serializable [name, options] tuples
// (function references cannot cross the Rust loader boundary).
const withMDX = createMDX({
  options: {
    rehypePlugins: ["rehype-sanitize", ["rehype-pretty-code", { theme: "github-dark" }]],
  },
});

export default withMDX(nextConfig);
