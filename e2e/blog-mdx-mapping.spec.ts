import { expect, test } from "@playwright/test";
import { expectComputedStyleMatchesToken } from "./support/tokenResolution";

/**
 * MDX → presentation seam E2E (FR-6, scenario mdx-elements-mapped).
 *
 * A single `MDXComponents` mapping re-renders every MDX element through
 * components styled from the semantic Tailwind token layer (`text-foreground`,
 * `text-primary`, `bg-muted`) — so headings, paragraphs, links and inline
 * code arrive styled by the seam, not by raw HTML default styling. The
 * authored Post `my-spec-driven-workflow` exercises h2, p, a, and inline
 * `code`.
 *
 * Route-migration task 004 (behavior 3): restated as token-resolution checks
 * per OQ-5 via `e2e/support/tokenResolution.ts` — computed style compared
 * against the resolved semantic-token var, zero rgb literals in this spec.
 */

test.describe("Blog MDX → presentation seam mapping", () => {
  test("headings, paragraphs, links and inline code render with the seam's token styling", async ({
    page,
  }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    // Heading → --foreground (headingLight), bold (raw <h2> would be UA default color).
    const heading = page.getByRole("heading", { name: "The Feature flow" });
    await expect(heading).toBeVisible();
    await expectComputedStyleMatchesToken(heading, "color", "--foreground");
    expect(await heading.evaluate((el) => getComputedStyle(el).fontWeight)).toBe("600");

    // Paragraph → the 1.125rem (18px) prose measure, not the raw <p> 16px UA size.
    // (Font size is a dimension, not a color token — no token-resolution helper needed.)
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
    // underline — asserting a token here would be a false failure.)
    const link = page.getByRole("link", { name: '"grill" interview' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /^https?:\/\/.+/);

    // Inline code → the seam's distinct token (text-primary on a bg-muted
    // background, monospace), not raw <code> default styling.
    const inlineCode = page.locator("code[data-mdx-inline-code]").first();
    await expect(inlineCode).toBeVisible();
    await expectComputedStyleMatchesToken(inlineCode, "color", "--primary");
    await expectComputedStyleMatchesToken(inlineCode, "background-color", "--muted");
    expect(await inlineCode.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/mono/i);
  });
});
