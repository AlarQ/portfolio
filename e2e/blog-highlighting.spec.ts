import { expect, test } from "@playwright/test";
import { expectComputedStyleMatchesToken } from "./support/tokenResolution";

/**
 * Build-time syntax highlighting E2E (FR-3, FR-8).
 *
 * Scenarios:
 * - code-block-highlighted: a fenced code block renders highlighted with zero
 *   runtime highlighting JavaScript.
 * - code-color-from-brand: a code token's color resolves from the
 *   `--shiki-token-comment` CSS var (sourced, since FR-8, from a `tokens.ts`
 *   primitive - not `brand`).
 * - code-block-highlighted (bg, both themes): the block's background resolves
 *   from `--shiki-bg` regardless of `.dark`, since the shiki set is a single
 *   dark island not routed through semantic light/dark aliasing (OQ-2, ADR-RM-3).
 *
 * Route-migration task 004 (behavior 2): restated as token-resolution checks
 * per OQ-5 - computed style compared against the resolved `--shiki-*` var via
 * `e2e/support/tokenResolution.ts`, zero rgb literals in this spec.
 *
 * The authored Post `my-spec-driven-workflow` contains a fenced ```yaml block.
 */

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

  test("code-color-from-brand: a token color resolves from --shiki-token-comment", async ({
    page,
  }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    const figure = page.locator("figure[data-rehype-pretty-code-figure]");
    await expect(figure).toBeVisible();

    // The yaml `# …` comment span carries the css-var foreground; its inline
    // style references --shiki-* (not a literal hue from the .mdx/theme).
    const commentSpan = figure.locator("code span[style*='--shiki-token-comment']").first();
    await expect(commentSpan).toHaveCount(1);

    await expectComputedStyleMatchesToken(commentSpan, "color", "--shiki-token-comment");
  });

  test("built_post_code_block_background_resolves_from_shiki_vars_both_themes", async ({
    page,
  }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    const pre = page.locator("figure[data-rehype-pretty-code-figure] pre").first();
    await expect(pre).toBeVisible();

    await expectComputedStyleMatchesToken(pre, "background-color", "--shiki-bg");

    // Shiki is a single dark-island set (OQ-2, ADR-RM-3) - not routed through
    // semanticDark, so toggling `.dark` on the root must not change the value.
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await expectComputedStyleMatchesToken(pre, "background-color", "--shiki-bg");
  });
});
