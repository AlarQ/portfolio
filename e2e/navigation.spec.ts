import { expect, test } from "@playwright/test";

/**
 * Navigation E2E against the single shadcn ds/Header (legacy MUI nav was
 * deleted). The site is blog-only: the nav exposes a single Blog link
 * pointed at "/" (the IA was inverted — the blog index now lives at "/" and
 * /blog 308-redirects there). Drawer mechanics (open/close/escape/backdrop)
 * and a11y are unchanged.
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

    // FR-6 (scenario author-nav-link): the single-source navItems.ts entry
    // surfaces the Author link in the desktop nav. getByRole excludes the
    // hidden mobile <nav> (asserted separately below).
    test("should display the Author navigation link", async ({ page }) => {
      await page.goto("/");

      await expect(page.getByRole("link", { name: "Author", exact: true })).toBeVisible();
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

      // Verify the drawer is not visible initially. The panel stays mounted
      // (it slides via a `translate-x` transform rather than unmounting), so
      // its accessibility state — `aria-hidden` — is the source of truth, not
      // Playwright's `toBeVisible` (which ignores off-screen transforms).
      await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "true");
    });

    test("should open and close drawer", async ({ page }) => {
      await page.goto("/blog");

      // Verify drawer is initially closed
      await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "true");

      // Open drawer
      await page.click('button[aria-label="Open menu"]');
      // Wait for animation to complete
      await page.waitForTimeout(500);
      await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "false");

      // Verify hamburger button changed to close button (aria-expanded state is
      // asserted in the Accessibility describe below). Scoped by aria-controls
      // since the drawer's own X button is also labeled "Close menu".
      const closeButton = page.locator('button[aria-controls="mobile-menu"]');
      await expect(closeButton).toHaveAttribute("aria-label", "Close menu");

      // Close drawer by pressing Escape (more reliable than clicking covered button)
      await page.keyboard.press("Escape");
      // Wait for animation to complete
      await page.waitForTimeout(500);
      await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "true");
    });

    test("should navigate from drawer", async ({ page }) => {
      // Start on a Post *detail* route so the drawer link produces a real URL
      // change (detail → blog index at "/"). Starting on /blog would make
      // toHaveURL("/") pass even if the click were a no-op.
      await page.goto("/blog/my-spec-driven-workflow");

      // Open drawer
      await page.click('button[aria-label="Open menu"]');
      await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "false");

      // Click the Blog link in the drawer — the IA was inverted, so the Blog
      // nav item now points at the site root "/" (see src/data/navItems.ts).
      await page.click('#mobile-menu a[href="/"]');

      // Verify real navigation off the detail route to the blog index at "/",
      // and that the drawer closed.
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "true");
    });

    // FR-6 (scenario author-nav-link): the same navItems.ts entry surfaces the
    // Author link inside the mobile drawer — proving the single-source nav
    // feeds both layouts.
    test("should show the Author link in the drawer", async ({ page }) => {
      await page.goto("/");

      await page.click('button[aria-label="Open menu"]');
      await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "false");

      await expect(page.locator('#mobile-menu a[href="/author"]')).toBeVisible();
    });

    test("should close drawer on backdrop click", async ({ page }) => {
      await page.goto("/blog");

      // Open drawer
      await page.click('button[aria-label="Open menu"]');
      await page.waitForTimeout(500);
      await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "false");

      // Click backdrop (area outside drawer) - using fixed position backdrop
      await page.mouse.click(50, 300);
      await page.waitForTimeout(500);

      // Verify drawer closed
      await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "true");
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
      await expect(page.locator('#mobile-menu a[href="/"]')).toBeFocused();
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

      // Check expanded state. Scoped by aria-controls since the drawer's own
      // X button is also labeled "Close menu" (button[aria-label="Close menu"]
      // alone matches both and violates Playwright's strict mode).
      const closeButton = page.locator('button[aria-controls="mobile-menu"]');
      await expect(closeButton).toHaveAttribute("aria-label", "Close menu");
      await expect(closeButton).toHaveAttribute("aria-expanded", "true");
    });

    // The nav landmark's presence and the Blog link's aria-current="page" are
    // already asserted by the Desktop Navigation describe above; not repeated.
  });
});

// The former "Visual Effects" describe asserted the legacy MUI Navigation
// component's own `backdrop-filter: blur(16px)` glass chrome. That component
// was deleted in favor of the single shadcn ds/Header (task 006 lineage),
// which has no equivalent blur/glassmorphism styling hook — so the test is
// removed rather than ported; there is nothing behavioral left to assert.
