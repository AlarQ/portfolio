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
});
