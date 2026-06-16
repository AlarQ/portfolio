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
  test("headings, paragraphs, links and inline code render as mapped MUI components", async ({
    page,
  }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    // Heading: the body "## The Feature flow" maps to an MUI Typography heading.
    const heading = page.getByRole("heading", { name: "The Feature flow" });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveClass(/MuiTypography-root/);

    // Paragraph: a body sentence renders inside an MUI Typography element.
    const paragraph = page
      .locator("p.MuiTypography-root", {
        hasText: "The job is never finished, because the boundary keeps moving.",
      })
      .first();
    await expect(paragraph).toBeVisible();

    // Link: the in-prose link maps to an MUI Link.
    const link = page.getByRole("link", { name: '"grill" interview' });
    await expect(link).toBeVisible();
    await expect(link).toHaveClass(/MuiLink-root/);

    // Inline code (e.g. `content/posts/`) maps through the seam, not raw <code>
    // default styling: it carries our mapped class hook.
    const inlineCode = page.locator("code[data-mdx-inline-code]").first();
    await expect(inlineCode).toHaveCount(1);
  });
});
