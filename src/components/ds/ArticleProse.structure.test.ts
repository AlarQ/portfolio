import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Structural (source-level) guard distinct from ArticleProse.test.tsx's
 * output assertions: proves ArticleProse never grows a second MDX
 * render/parse path (FR-11, sec-no-second-mdx-render-path). Reads the
 * source file itself rather than rendered output, so a future refactor that
 * technically still hardens `rel`/scripts but does so via a *second*,
 * independent MDX compiler import would still be caught.
 */

const SOURCE_PATH = join(import.meta.dirname, "ArticleProse.tsx");

describe("ArticleProse - no second MDX render path (sec-no-second-mdx-render-path)", () => {
  const source = readFileSync(SOURCE_PATH, "utf8");

  it("imports MDX rendering only from the single mdxPresentation seam, never an independent MDX compiler/parser", () => {
    const mdxLikeImports = [
      "next-mdx-remote",
      "@mdx-js",
      "rehype",
      "remark",
      "markdown-to-jsx",
      "react-markdown",
    ];

    for (const forbidden of mdxLikeImports) {
      expect(source).not.toContain(forbidden);
    }
  });

  it("contains no dangerouslySetInnerHTML", () => {
    expect(source).not.toContain("dangerouslySetInnerHTML");
  });
});
