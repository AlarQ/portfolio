import { expect, test } from "@playwright/test";

/**
 * Build-time syntax highlighting E2E (FR-3).
 *
 * Scenarios:
 * - code-block-highlighted: a fenced code block renders highlighted with zero
 *   runtime highlighting JavaScript.
 * - code-color-from-brand: a code token's color resolves from a `--shiki-*` CSS
 *   var (sourced from a `brand` token), not from the `.mdx` or a Shiki theme.
 *
 * The authored Post `hello-world` contains a fenced ```js code block.
 */

/** brand.skyLight (#38bdf8) — the keyword token color, via --shiki-token-keyword. */
const KEYWORD_RGB = "rgb(56, 189, 248)";

test.describe("Blog build-time syntax highlighting", () => {
  test("code-block-highlighted: fenced block renders highlighted with no runtime highlighting JS", async ({
    page,
  }) => {
    const scriptUrls: string[] = [];
    page.on("request", (req) => {
      if (req.resourceType() === "script") scriptUrls.push(req.url());
    });

    await page.goto("/blog/hello-world");

    // rehype-pretty-code wraps highlighted blocks in a figure with this marker.
    const figure = page.locator("figure[data-rehype-pretty-code-figure]");
    await expect(figure).toBeVisible();

    // Highlighting produced per-token <span> markup (more than one colored span),
    // i.e. the block is tokenized, not a single plain <pre>.
    const tokenSpans = figure.locator("code span[style*='color']");
    expect(await tokenSpans.count()).toBeGreaterThan(1);

    // Zero runtime highlighting JS: no Shiki / highlight.js / prism bundle ships.
    const highlightBundle = scriptUrls.find((u) =>
      /shiki|highlight\.js|highlightjs|prism/i.test(u)
    );
    expect(highlightBundle, `unexpected runtime highlighter: ${highlightBundle}`).toBeUndefined();
  });

  test("code-color-from-brand: a token color resolves from a --shiki-* var (brand)", async ({
    page,
  }) => {
    await page.goto("/blog/hello-world");

    const figure = page.locator("figure[data-rehype-pretty-code-figure]");
    await expect(figure).toBeVisible();

    // The `const` / `function` keyword span carries the css-var foreground; its
    // inline style references --shiki-* (not a literal hue from the .mdx/theme).
    const keywordSpan = figure.locator("code span[style*='--shiki-token-keyword']").first();
    await expect(keywordSpan).toHaveCount(1);

    // The computed color RESOLVES to the brand token wired into that --shiki var.
    const computed = await keywordSpan.evaluate((el) => getComputedStyle(el).color);
    expect(computed).toBe(KEYWORD_RGB);
  });
});
