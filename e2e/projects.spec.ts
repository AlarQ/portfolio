import { expect, test } from "@playwright/test";

/**
 * Projects route E2E.
 *
 * The site is blog-only: the `/projects` route was removed, so the path now
 * resolves to the not-found response. This pins that 404 so a regression that
 * re-adds the route is caught.
 */

test.describe("Projects route", () => {
  test("returns the not-found response for /projects", async ({ page }) => {
    const response = await page.goto("/projects");

    expect(response?.status()).toBe(404);
  });
});
