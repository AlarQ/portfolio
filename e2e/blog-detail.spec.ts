import { expect, test } from "@playwright/test";

/**
 * Blog Post detail E2E Tests
 *
 * Tests the Post detail page at /blog/[slug]
 *
 * Scenario: detail-renders-body (FR-2)
 * - Given an authored Post `hello-world`
 * - When a reader visits /blog/hello-world
 * - Then the MDX body renders as HTML in the statically generated page
 */

test.describe("Blog Post detail", () => {
  /**
   * POSITIVE TEST: Verify the authored MDX body renders as HTML
   * Objective: Ensure /blog/<slug> renders the Post's MDX body as rendered HTML
   */
  test("renders the authored MDX body as HTML", async ({ page }) => {
    // Arrange + Act: visit the detail route for the one authored Post
    await page.goto("/blog/hello-world");

    // Assert: a distinctive sentence from the MDX body appears as rendered text
    const bodyProse = page.getByText("This is the very first Post on the Blog.", { exact: false });
    await expect(bodyProse).toBeVisible();
  });

  /**
   * REGRESSION GUARD: the `---` frontmatter block must NOT render in the body.
   * Without `remark-frontmatter` in the MDX pipeline (next.config.ts), the
   * leading `---...---` block renders as a thematic break (<hr>) plus raw
   * `title:/dek:/date:` text atop every Post. This pins the body to start at the
   * authored prose — the unit suite can't cover it (Next compiles the body, not
   * the loader). See reports/architecture-data.md finding 1.
   */
  test("does not leak raw frontmatter into the rendered body", async ({ page }) => {
    // Arrange + Act: visit the detail route for the one authored Post
    await page.goto("/blog/hello-world");

    // Assert: the raw `title:` frontmatter line is absent from the rendered body
    await expect(page.getByText("title: Hello World", { exact: false })).toHaveCount(0);

    // Assert: the article body has no thematic break standing in for the block
    await expect(page.locator("article hr")).toHaveCount(0);
  });

  /**
   * NEGATIVE TEST: unknown slug returns the not-found response (FR-2)
   * Scenario: detail-unknown-slug-404
   * - Given no Post file maps to slug `does-not-exist`
   * - When a reader visits /blog/does-not-exist
   * - Then the site returns its not-found response and no Post is rendered
   *
   * generateStaticParams maps the loader output; a slug not in that set is not
   * pre-rendered (dynamicParams=false) and resolves to the 404 response.
   */
  test("returns the not-found response for a slug not in the Post set", async ({ page }) => {
    // Arrange + Act: request a slug with no backing Post file
    const response = await page.goto("/blog/does-not-exist");

    // Assert: the site returns its not-found response (HTTP 404)
    expect(response?.status()).toBe(404);
  });
});
