import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
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

// Turbopack requires rehype plugins as serializable [name, options] tuples
// (function references cannot cross the Rust loader boundary). The theme object
// above is plain JSON, so it crosses that boundary intact.
const withMDX = createMDX({
  options: {
    rehypePlugins: [
      "rehype-sanitize",
      ["rehype-pretty-code", { theme: shikiCssVarTheme, keepBackground: true }],
    ],
  },
});

export default withMDX(nextConfig);
