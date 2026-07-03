import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  // Blog-only surface: `/` redirects to the blog index, and the home layout
  // (`src/app/page.tsx`) is shadowed by this rule (Next.js applies config
  // redirects before filesystem routes). `temporary` (307) keeps the option to
  // restore a real home page later open.
  async redirects() {
    return [{ source: "/", destination: "/blog", permanent: false }];
  },
};

/**
 * Shiki v4 removed the packaged `css-variables` theme string (it now throws), so
 * the supported replacement is a JSON theme object whose every foreground is a
 * `var(--shiki-*)` reference — keeping all real hues in globals.css brand tokens.
 */
const shikiCssVarTheme = {
  name: "brand-css-vars",
  type: "dark",
  colors: {
    "editor.background": "var(--shiki-bg)",
    "editor.foreground": "var(--shiki-fg)",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "var(--shiki-token-comment)" },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier", "keyword.control"],
      settings: { foreground: "var(--shiki-token-keyword)" },
    },
    {
      scope: ["string", "string.quoted", "punctuation.definition.string"],
      settings: { foreground: "var(--shiki-token-string)" },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.character", "support.constant"],
      settings: { foreground: "var(--shiki-token-constant)" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: "var(--shiki-token-function)" },
    },
    {
      scope: ["variable", "variable.other", "meta.definition.variable", "support.variable"],
      settings: { foreground: "var(--shiki-token-variable)" },
    },
  ],
};

// Turbopack requires plugins as serializable [name, options] tuples (function
// references cannot cross the Rust loader boundary). The theme object above is
// plain JSON, so it crosses that boundary intact.
//
// `remark-frontmatter` tokenizes the leading `---...---` block as a frontmatter
// node so MDX excludes it from the rendered body. Without it the block renders
// as a thematic break + raw `title:/dek:/date:` text atop every Post. The
// loader (`postLoader.ts`) reads that same frontmatter independently via
// gray-matter for Post metadata — two reads of one file, each now frontmatter-aware.
//
// Mermaid is NOT rendered here. `rehype-mermaid` launched a headless Chromium
// during `next build`, which broke Vercel's browserless build image. Diagrams
// are now pre-rendered to committed SVGs by a pre-commit step
// (`scripts/prerender-mermaid.mjs`) and referenced from Post bodies via the
// `<Diagram>` component — so `next build` runs no browser. The only MDX plugin
// left that touches code is `rehype-pretty-code`, which highlights js/ts/bash/
// etc. fences with Shiki. Its options object is plain JSON, so it survives the
// Turbopack serializable-tuple boundary (see note above).
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-frontmatter"]],
    // `rehype-slug` assigns a stable, deterministic `id` to every heading
    // (github-slugger algorithm) which flows through the existing `heading()`
    // seam (`src/utils/mdxPresentationText.tsx`) — no second render path.
    rehypePlugins: [
      ["rehype-slug"],
      ["rehype-pretty-code", { theme: shikiCssVarTheme, keepBackground: true }],
    ],
  },
});

export default withMDX(nextConfig);
