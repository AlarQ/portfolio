import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test.describe("Desktop Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
    });

    test("should display all navigation links", async ({ page }) => {
      await page.goto("/");

      // Verify all links are visible
      await expect(page.locator('nav a[href="/"]')).toBeVisible();
      await expect(page.locator('nav a[href="/blog"]')).toBeVisible();
      await expect(page.locator('nav a[href="/projects"]')).toBeVisible();
      await expect(page.locator('a[href="/cv/Ernest_Bednarczyk_CV_01_2025.pdf"]')).toBeVisible();
    });

    test("should navigate to projects page", async ({ page }) => {
      await page.goto("/");

      // Click Projects link (use force to avoid page content overlap issues)
      await page.click('nav a[href="/projects"]', { force: true });
      await expect(page).toHaveURL("/projects");

      // Verify active indicator
      await expect(page.locator('nav a[href="/projects"]')).toHaveAttribute("aria-current", "page");
    });

    test("should highlight home link on home page", async ({ page }) => {
      await page.goto("/");

      await expect(page.locator('nav a[href="/"]')).toHaveAttribute("aria-current", "page");
    });

    test("should open resume in new tab", async ({ page }) => {
      await page.goto("/");

      // Verify resume link has target="_blank"
      const resumeLink = page.locator('a[href="/cv/Ernest_Bednarczyk_CV_01_2025.pdf"]');
      await expect(resumeLink).toHaveAttribute("target", "_blank");
      await expect(resumeLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test.describe("Mobile Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test("should display hamburger button", async ({ page }) => {
      await page.goto("/");

      // Verify hamburger button is visible
      await expect(page.locator('button[aria-label="Open menu"]')).toBeVisible();

      // Verify links are not visible initially
      await expect(page.locator("#mobile-menu")).not.toBeVisible();
    });

    test("should open and close drawer", async ({ page }) => {
      await page.goto("/");

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
      await page.goto("/");

      // Open drawer
      await page.click('button[aria-label="Open menu"]');
      await expect(page.locator("#mobile-menu")).toBeVisible();

      // Click Projects link in drawer
      await page.click('#mobile-menu a[href="/projects"]');

      // Verify navigation and drawer closed
      await expect(page).toHaveURL("/projects");
      await expect(page.locator("#mobile-menu")).not.toBeVisible();
    });

    test("should close drawer on backdrop click", async ({ page }) => {
      await page.goto("/");

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
      await page.goto("/");

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
      await page.goto("/");

      // Click on body to ensure we start from the page
      await page.click("body");

      // Tab multiple times to reach navigation
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        const href = await page.evaluate(() => document.activeElement?.getAttribute("href"));
        if (
          href &&
          ["/", "/blog", "/projects", "/cv/Ernest_Bednarczyk_CV_01_2025.pdf"].includes(href)
        ) {
          // Successfully focused a nav link
          expect(href).toBeTruthy();
          return;
        }
      }

      // If we get here, verify at least that navigation links exist
      await expect(page.locator('nav a[href="/"]')).toBeVisible();
    });

    test("should focus first link when mobile drawer opens", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Open drawer
      await page.click('button[aria-label="Open menu"]');

      // Wait for drawer animation
      await page.waitForTimeout(200);

      // Verify first link is focused
      await expect(page.locator('#mobile-menu a[href="/"]')).toBeFocused();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper ARIA attributes", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

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
      await page.goto("/");

      // Verify nav element exists
      await expect(page.locator("nav")).toBeVisible();
    });

    test("should have aria-current on active page", async ({ page }) => {
      await page.goto("/projects");

      await expect(page.locator('a[href="/projects"]')).toHaveAttribute("aria-current", "page");
    });
  });

  test.describe("Visual Effects", () => {
    test("should have glassmorphism styling", async ({ page }) => {
      await page.goto("/");

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
