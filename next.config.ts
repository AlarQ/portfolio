import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

/**
 * Shiki theme whose every color is a `var(--shiki-*)` reference rather than a
 * literal hue — the build-time bridge for ADR-0001's *one source of color truth,
 * two surfaces*. rehype-pretty-code highlights code at build time (zero runtime
 * highlighting JS); because the resolved colors are CSS vars, the actual hues
 * come from `globals.css` → `brand` tokens, never from this theme or the `.mdx`
 * file. The matching `--shiki-*` vars are declared in `src/app/globals.css` and
 * locked to `brand` by `src/theme/shikiVars.test.ts`.
 *
 * (Shiki v4 dropped the packaged `css-variables` theme; supplying a JSON theme
 * — detected by its `tokenColors` key — whose foregrounds are CSS vars is the
 * supported replacement.)
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
