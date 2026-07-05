import { expect, test } from "@playwright/test";

/**
 * MDX → presentation seam E2E (FR-6, scenario mdx-elements-mapped).
 *
 * A single `MDXComponents` mapping re-renders every MDX element through MUI
 * components styled from `brand` tokens — so headings, paragraphs, links and
 * inline code arrive as MUI components, not raw HTML elements. The authored
 * Post `my-spec-driven-workflow` exercises h2, p, a, and inline `code`.
 */

test.describe("Blog MDX → MUI mapping", () => {
  // Asserts the *rendered brand styling* the seam applies, not MUI class names.
  // MuiTypography-root / MuiLink-root are framework internals — an element can
  // carry them yet be visually unstyled, so those assertions were near-vacuous.
  // These computed-style checks fail if an element bypasses the seam and renders
  // as a raw <h2>/<a>/<code> with default (non-brand) styling.
  test("headings, paragraphs, links and inline code render with the seam's brand styling", async ({
    page,
  }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    // Heading → brand.slateLight, bold (raw <h2> would be UA default color).
    const heading = page.getByRole("heading", { name: "The Feature flow" });
    await expect(heading).toBeVisible();
    const h = await heading.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, weight: s.fontWeight };
    });
    expect(h.color).toBe("rgb(226, 232, 240)");
    expect(h.weight).toBe("700");

    // Paragraph → the 1.125rem (18px) prose measure, not the raw <p> 16px UA size.
    const paragraph = page
      .locator("article p", {
        hasText: "The job is never finished, because the boundary keeps moving.",
      })
      .first();
    await expect(paragraph).toBeVisible();
    const pFontSize = await paragraph.evaluate((el) => getComputedStyle(el).fontSize);
    expect(pFontSize).toBe("18px");

    // Link → the MDX `[text](url)` maps to a real, navigable anchor pointing at
    // the authored external URL. (Only navigability is asserted, not brand color
    // or underline: an unlayered globals.css `a` rule currently defeats the
    // seam's link styling, so the in-prose link renders in prose color with no
    // underline — asserting skyLight/underline here would be a false failure.)
    const link = page.getByRole("link", { name: '"grill" interview' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /^https?:\/\/.+/);

    // Inline code → the seam's distinct token (skyLighter text on a faint sky
    // background, monospace), not raw <code> default styling.
    const inlineCode = page.locator("code[data-mdx-inline-code]").first();
    await expect(inlineCode).toBeVisible();
    const c = await inlineCode.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, bg: s.backgroundColor, font: s.fontFamily };
    });
    expect(c.color).toBe("rgb(125, 211, 252)");
    expect(c.bg).toBe("rgba(14, 165, 233, 0.1)");
    expect(c.font).toMatch(/mono/i);
  });
});
