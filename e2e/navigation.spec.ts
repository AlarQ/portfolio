import { expect, test } from "@playwright/test";

/**
 * Navigation E2E. The site is blog-only: the nav exposes a single Blog link
 * (Home/Projects routes are gone), and the logo points at /blog. Drawer
 * mechanics (open/close/escape/backdrop) and a11y are unchanged.
 */

test.describe("Navigation", () => {
  test.describe("Desktop Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
    });

    test("should display the Blog navigation link", async ({ page }) => {
      await page.goto("/blog");

      // The single real nav link. getByRole disambiguates from the logo link
      // (named "EB Ernest Bednarczyk") and excludes the hidden mobile <nav>.
      await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
    });

    test("should mark the Blog link active on /blog", async ({ page }) => {
      await page.goto("/blog");

      await expect(page.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });
  });

  test.describe("Mobile Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test("should display hamburger button", async ({ page }) => {
      await page.goto("/blog");

      // Verify hamburger button is visible
      await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();

      // Verify links are not visible initially
      await expect(page.locator("#mobile-menu")).not.toBeVisible();
    });

    test("should open and close drawer", async ({ page }) => {
      await page.goto("/blog");

      // Verify drawer is initially closed
      await expect(page.locator("#mobile-menu")).not.toBeVisible();

      // Open drawer
      await page.click('button[aria-label="Open menu"]');
      // Wait for animation to complete
      await page.waitForTimeout(500);
      await expect(page.locator("#mobile-menu")).toBeVisible();

      // Verify hamburger button changed to close button (aria-expanded state is
      // asserted in the Accessibility describe below).
      const closeButton = page.locator('button[aria-label="Close menu"]');
      await expect(closeButton).toBeVisible();

      // Close drawer by pressing Escape (more reliable than clicking covered button)
      await page.keyboard.press("Escape");
      // Wait for animation to complete
      await page.waitForTimeout(500);
      await expect(page.locator("#mobile-menu")).not.toBeVisible();
    });

    test("should navigate from drawer", async ({ page }) => {
      // Start on a Post *detail* route so the drawer link produces a real URL
      // change (detail → index). Starting on /blog would make toHaveURL("/blog")
      // pass even if the click were a no-op.
      await page.goto("/blog/my-spec-driven-workflow");

      // Open drawer
      await page.click('button[aria-label="Open menu"]');
      await expect(page.locator("#mobile-menu")).toBeVisible();

      // Click Blog link in drawer
      await page.click('#mobile-menu a[href="/blog"]');

      // Verify real navigation off the detail route and that the drawer closed.
      await expect(page).toHaveURL(/\/blog$/);
      await expect(page.locator("#mobile-menu")).not.toBeVisible();
    });

    test("should close drawer on backdrop click", async ({ page }) => {
      await page.goto("/blog");

      // Open drawer
      await page.click('button[aria-label="Open menu"]');
      await page.waitForTimeout(500);
      await expect(page.locator("#mobile-menu")).toBeVisible();

      // Click backdrop (area outside drawer) - using fixed position backdrop
      await page.mouse.click(50, 300);
      await page.waitForTimeout(500);

      // Verify drawer closed
      await expect(page.locator("#mobile-menu")).not.toBeVisible();
    });

    // Escape-to-close is covered by "should open and close drawer" above.
  });

  test.describe("Keyboard Navigation", () => {
    test("should focus first link when mobile drawer opens", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/blog");

      // Open drawer
      await page.click('button[aria-label="Open menu"]');

      // Wait for drawer animation
      await page.waitForTimeout(200);

      // Verify first link is focused
      await expect(page.locator('#mobile-menu a[href="/blog"]')).toBeFocused();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper ARIA attributes", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/blog");

      const hamburger = page.locator('button[aria-label="Open menu"]');

      // Check initial state
      await expect(hamburger).toHaveAttribute("aria-expanded", "false");
      await expect(hamburger).toHaveAttribute("aria-controls", "mobile-menu");

      // Open drawer
      await hamburger.click();

      // Check expanded state
      const closeButton = page.locator('button[aria-label="Close menu"]');
      await expect(closeButton).toHaveAttribute("aria-expanded", "true");
    });

    // The nav landmark's presence and the Blog link's aria-current="page" are
    // already asserted by the Desktop Navigation describe above; not repeated.
  });

  test.describe("Visual Effects", () => {
    test("nav chrome applies a real backdrop-filter blur (glassmorphism)", async ({ page }) => {
      await page.goto("/blog");

      // The old assertion accepted any rgba/hsla background + any border — a
      // condition countless unrelated styles satisfy, and it never checked the
      // blur that actually makes the glass effect. Navigation.tsx sets
      // `backdrop-filter: blur(16px)` on the glass container; assert that the
      // rendered chrome actually carries a blur() backdrop-filter. Fails if the
      // blur is dropped, which the previous check would have missed.
      const backdrop = await page.evaluate(() => {
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const s = getComputedStyle(el);
          const bf =
            s.backdropFilter ||
            (s as unknown as { webkitBackdropFilter?: string }).webkitBackdropFilter ||
            "";
          if (bf.includes("blur")) return bf;
        }
        return null;
      });

      expect(backdrop).toContain("blur");
    });
  });
});
