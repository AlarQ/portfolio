import { expect, test } from "@playwright/test";

/**
 * In-page Table of Contents E2E (FR-1).
 *
 * Post: my-spec-driven-workflow — a long post with many ##/### sections. The ToC
 * is a sticky desktop aside; its links must reuse the exact heading ids that the
 * single heading seam (task 001, rehype-slug) renders to the DOM, in document
 * order.
 *
 * Scenarios: toc-renders-from-headings, toc-sticky-desktop, toc-hidden-mobile.
 */

const POST_PATH = "/blog/my-spec-driven-workflow";

test.describe("Blog in-page Table of Contents (desktop)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("lists the post's headings in document order and is sticky", async ({ page }) => {
    await page.goto(POST_PATH);

    const toc = page.getByRole("navigation", { name: "Table of contents" });
    await expect(toc).toBeVisible();

    // The ids the heading seam rendered to the DOM, in document order.
    const headingIds = await page
      .locator("article :is(h2, h3)[id]")
      .evaluateAll((els) => els.map((el) => el.id));
    expect(headingIds.length).toBeGreaterThan(1);

    // Every ToC link, in document order, points at the matching heading id.
    const tocHrefs = await toc
      .getByRole("link")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(tocHrefs).toEqual(headingIds.map((id) => `#${id}`));

    // Human-readable order sanity: the first section is the post's first ##.
    await expect(toc.getByRole("link").first()).toHaveText("The boundary I keep pushing out");

    // Sticky beside the prose column so it stays visible as the reader scrolls.
    await expect(toc).toHaveCSS("position", "sticky");
  });

  // toc-renders-from-headings (jump behavior): activating a ToC link updates the
  // URL hash to that heading's id and scrolls the matching heading into view.
  test("clicking a ToC link resolves the page to the matching heading id", async ({ page }) => {
    await page.goto(POST_PATH);

    const toc = page.getByRole("navigation", { name: "Table of contents" });
    const firstLink = toc.getByRole("link").first();
    const targetId = (await firstLink.getAttribute("href"))?.slice(1);
    expect(targetId).toBeTruthy();

    await firstLink.click();

    await expect(page).toHaveURL(new RegExp(`#${targetId}$`));
    await expect(page.locator(`#${targetId}`)).toBeInViewport();
  });
});

test.describe("Blog in-page Table of Contents (mobile)", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  // toc-hidden-mobile: a ~34-char mobile measure has no room for a sidebar, so
  // the ToC aside is hard-hidden (no collapsible variant) and the prose column
  // occupies the full width without the aside crowding it.
  test("does not render the ToC aside and lets the prose span the full width", async ({ page }) => {
    await page.goto(POST_PATH);

    const toc = page.getByRole("navigation", { name: "Table of contents" });
    await expect(toc).toBeHidden();

    // Prose spans the viewport (minus its own gutters) — the aside claims no
    // horizontal room: the article width is within a small padding budget of the
    // full viewport, and the page never scrolls sideways.
    const article = page.locator("article");
    await expect(article).toBeVisible();
    const articleWidth = await article.evaluate((el) => el.getBoundingClientRect().width);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(articleWidth).toBeGreaterThan(viewportWidth * 0.8);

    // No-horizontal-body-scroll at this viewport is asserted in blog.spec.ts
    // ("contains code-block overflow on mobile with no body horizontal scroll"),
    // so it is not repeated here.
  });
});
