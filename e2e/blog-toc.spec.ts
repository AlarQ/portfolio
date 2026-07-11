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
});
