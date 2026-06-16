import { expect, test } from "@playwright/test";

/**
 * Root route E2E.
 *
 * The site is blog-only: `/` is redirected to `/blog` at the config layer
 * (next.config.ts `redirects()`), so there is no home page to test. This pins
 * the redirect so a regression that re-exposes a home route is caught.
 */

test.describe("Root route", () => {
  test("redirects / to /blog", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/blog");
  });
});
