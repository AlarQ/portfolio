import { expect, test } from "@playwright/test";
import { TOC_ACCESSIBLE_NAME } from "@/components/ds/TableOfContents";

/**
 * In-page Table of Contents route-level composition E2E (FR-1, task 004).
 *
 * Post: my-spec-driven-workflow — a long post with many ##/### sections.
 * This is route-level composition verification: it confirms the ToC that
 * `pages/SinglePost` composes into the live route resolves to the accessible
 * name 003 already locked at the component level (`TableOfContents.test.tsx`,
 * imported here rather than restated, so the two levels can't drift) and that
 * its links reuse the exact heading ids the single heading seam (task 001,
 * rehype-slug) renders to the DOM, in document order. It does not re-derive
 * or re-assert the accessible-name string itself — that's 003's job.
 *
 * Sticky/desktop-aside layout and mobile-hidden behavior are chunk 3
 * (visual/CSS) scope, not this chunk's.
 */

const POST_PATH = "/blog/my-spec-driven-workflow";

test.describe("Blog in-page Table of Contents (route composition)", () => {
  test("resolves the locked accessible name and links every heading id in document order", async ({
    page,
  }) => {
    await page.goto(POST_PATH);

    const toc = page.getByRole("navigation", { name: TOC_ACCESSIBLE_NAME });
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
  });

  // Restores `toc-sticky-desktop` (blog-readability spec), dropped by task 004's
  // rewrite without re-homing (cq-001, specs/route-migration/tasks/004-...).
  test("desktop: the ToC dot-rail is visible and sticky", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(POST_PATH);

    const toc = page.getByRole("navigation", { name: TOC_ACCESSIBLE_NAME });
    await expect(toc).toBeVisible();

    const position = await toc.evaluate((el) => getComputedStyle(el.parentElement ?? el).position);
    expect(position).toBe("sticky");
  });

  // Restores `toc-hidden-mobile`. Uses an attribute locator, NOT getByRole:
  // Playwright's role query prunes `display:none` elements to zero matches,
  // so it can never resolve an element to assert toBeHidden() against.
  test("mobile: the ToC nav is not visible", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(POST_PATH);

    const toc = page.locator(`nav[aria-label="${TOC_ACCESSIBLE_NAME}"]`);
    await expect(toc).toBeHidden();
  });

  // Adds `toc-progress-mobile`: the reading-progress bar is the only mobile
  // ToC-adjacent affordance, and it's absent (not just hidden) from desktop.
  test("mobile progress bar is visible on mobile, hidden on desktop", async ({ page }) => {
    await page.goto(POST_PATH);

    await page.setViewportSize({ width: 375, height: 812 });
    const mobileBar = page.getByRole("progressbar", { name: "Reading progress" });
    await expect(mobileBar).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 900 });
    const desktopBar = page.getByRole("progressbar", { name: "Reading progress" });
    await expect(desktopBar).toBeHidden();
  });

  // Adds `toc-scrollspy-active`: scrolling a heading into view marks its ToC
  // link as the active section.
  test("scroll-spy marks the in-view heading's ToC link as active", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(POST_PATH);

    const toc = page.getByRole("navigation", { name: TOC_ACCESSIBLE_NAME });
    const headings = page.locator("article :is(h2, h3)[id]");
    const midIndex = Math.floor((await headings.count()) / 2);
    const midHeading = headings.nth(midIndex);
    const midId = await midHeading.getAttribute("id");

    // Scroll the heading to just below the IntersectionObserver's reading-zone
    // top edge (rootMargin "-96px 0px -70% 0px" in useActiveHeading), not just
    // "into view" — scrollIntoViewIfNeeded can align it flush to the viewport
    // top, outside the observed zone, and never fire an intersection.
    await midHeading.evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - 150 });
    });

    const activeLink = toc.locator(`a[href="#${midId}"]`);
    await expect(activeLink).toHaveAttribute("aria-current", "location");
  });
});
