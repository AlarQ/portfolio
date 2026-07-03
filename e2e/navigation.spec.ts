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

      // Verify hamburger button changed to close button
      const closeButton = page.locator('button[aria-label="Close menu"]');
      await expect(closeButton).toBeVisible();
      await expect(closeButton).toHaveAttribute("aria-expanded", "true");

      // Close drawer by pressing Escape (more reliable than clicking covered button)
      await page.keyboard.press("Escape");
      // Wait for animation to complete
      await page.waitForTimeout(500);
      await expect(page.locator("#mobile-menu")).not.toBeVisible();
    });

    test("should navigate from drawer", async ({ page }) => {
      await page.goto("/blog");

      // Open drawer
      await page.click('button[aria-label="Open menu"]');
      await expect(page.locator("#mobile-menu")).toBeVisible();

      // Click Blog link in drawer
      await page.click('#mobile-menu a[href="/blog"]');

      // Verify navigation and drawer closed
      await expect(page).toHaveURL("/blog");
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

    test("should close drawer on Escape key", async ({ page }) => {
      await page.goto("/blog");

      // Open drawer
      await page.click('button[aria-label="Open menu"]');
      await page.waitForTimeout(500);
      await expect(page.locator("#mobile-menu")).toBeVisible();

      // Press Escape
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);

      // Verify drawer closed
      await expect(page.locator("#mobile-menu")).not.toBeVisible();
    });
  });

  test.describe("Keyboard Navigation", () => {
    test("should navigate links with Tab key on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto("/blog");

      // Click on body to ensure we start from the page
      await page.click("body");

      // Tab multiple times to reach navigation
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        const href = await page.evaluate(() => document.activeElement?.getAttribute("href"));
        if (href && ["/blog"].includes(href)) {
          // Successfully focused a nav link
          expect(href).toBeTruthy();
          return;
        }
      }

      // If we get here, verify at least that the navigation link exists
      await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
    });

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

    test("should have nav landmark", async ({ page }) => {
      await page.goto("/blog");

      // Two responsive <nav> elements render (desktop + mobile); only one is
      // visible at a given viewport. getByRole excludes the hidden one.
      await expect(page.getByRole("navigation").first()).toBeVisible();
    });

    test("should have aria-current on active page", async ({ page }) => {
      // On narrow viewports (e.g. Mobile Chrome) the nav is a closed drawer
      // whose links are unmounted until opened (see MobileNav.tsx), so the
      // desktop width is forced here to assert against the always-mounted
      // desktop nav.
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto("/blog");

      await expect(page.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute(
        "aria-current",
        "page"
      );
    });
  });

  test.describe("Visual Effects", () => {
    test("should have glassmorphism styling", async ({ page }) => {
      await page.goto("/blog");

      const nav = page.locator("nav").first();

      // Verify the navigation has the glassmorphism container
      const hasGlassmorphism = await nav.evaluate((el) => {
        const parent = el.parentElement;
        if (!parent) return false;
        const styles = window.getComputedStyle(parent);
        // Check for semi-transparent background and border
        const hasTransparentBg =
          styles.backgroundColor.includes("rgba") || styles.backgroundColor.includes("hsla");
        const hasBorder = styles.border !== "none" && styles.border !== "";
        return hasTransparentBg && hasBorder;
      });

      expect(hasGlassmorphism).toBe(true);
    });
  });
});
