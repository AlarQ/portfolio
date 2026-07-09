import { expect, test } from "@playwright/test";

/**
 * Build-time syntax highlighting E2E (FR-3, FR-8).
 *
 * Scenarios:
 * - code-block-highlighted: a fenced code block renders highlighted with zero
 *   runtime highlighting JavaScript.
 * - code-color-from-brand: a code token's color resolves from a `--shiki-*` CSS
 *   var (sourced, since FR-8, from a `tokens.ts` primitive — not `brand`).
 * - code-block-highlighted (bg, both themes): the block's background resolves
 *   from `--shiki-bg` regardless of `.dark`, since the shiki set is a single
 *   dark island not routed through semantic light/dark aliasing (OQ-2, ADR-RM-3).
 *
 * The authored Post `my-spec-driven-workflow` contains a fenced ```yaml block.
 */

/** tokens.ts shikiTokenComment (#64748b) — the comment token color. */
const COMMENT_RGB = "rgb(100, 116, 139)";
/** tokens.ts shikiBg (#141b22) — the code-block background, both themes. */
const SHIKI_BG_RGB = "rgb(20, 27, 34)";

test.describe("Blog build-time syntax highlighting", () => {
  test("code-block-highlighted: fenced block renders highlighted with no runtime highlighting JS", async ({
    page,
  }) => {
    const scriptUrls: string[] = [];
    page.on("request", (req) => {
      if (req.resourceType() === "script") scriptUrls.push(req.url());
    });

    await page.goto("/blog/my-spec-driven-workflow");

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
    await page.goto("/blog/my-spec-driven-workflow");

    const figure = page.locator("figure[data-rehype-pretty-code-figure]");
    await expect(figure).toBeVisible();

    // The yaml `# …` comment span carries the css-var foreground; its inline
    // style references --shiki-* (not a literal hue from the .mdx/theme).
    const commentSpan = figure.locator("code span[style*='--shiki-token-comment']").first();
    await expect(commentSpan).toHaveCount(1);

    // The computed color RESOLVES to the brand token wired into that --shiki var.
    // getComputedStyle().color always returns a normalized `rgb(r, g, b)` string,
    // so we can compare it directly.
    const computed = await commentSpan.evaluate((el) => getComputedStyle(el).color);
    expect(computed).toBe(COMMENT_RGB);
  });

  test("built_post_code_block_background_resolves_from_shiki_vars_both_themes", async ({
    page,
  }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    const pre = page.locator("figure[data-rehype-pretty-code-figure] pre").first();
    await expect(pre).toBeVisible();

    const lightBg = await pre.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(lightBg).toBe(SHIKI_BG_RGB);

    // Shiki is a single dark-island set (OQ-2, ADR-RM-3) — not routed through
    // semanticDark, so toggling `.dark` on the root must not change the value.
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    const darkBg = await pre.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(darkBg).toBe(SHIKI_BG_RGB);
  });
});
