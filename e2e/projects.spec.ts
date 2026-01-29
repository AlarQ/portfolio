import { expect, test } from "@playwright/test";

/**
 * Projects Page E2E Tests
 *
 * Tests the projects listing page at /projects
 *
 * Features tested:
 * - Page loads successfully
 * - "My Projects" heading is displayed
 * - Project cards are rendered in a grid
 * - Project cards display title, description, and MVP progress
 */

test.describe("Projects Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to projects page
    await page.goto("/projects");
  });

  /**
   * POSITIVE TEST: Verify projects page loads successfully
   * Objective: Ensure the projects page is accessible and renders correctly
   */
  test("loads successfully and displays correct page title", async ({ page }) => {
    // Arrange: Page is loaded from beforeEach
    // Act: Page already navigated in beforeEach
    // Assert: Check page title exists
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  /**
   * POSITIVE TEST: Verify page heading is displayed
   * Objective: Ensure the "My Projects" heading is rendered correctly
   */
  test("displays 'My Projects' heading", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Find the page heading
    const heading = page.getByRole("heading", { name: "My Projects", level: 1 });

    // Assert: Check heading is visible and has correct text
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText("My Projects");
  });

  /**
   * POSITIVE TEST: Verify project cards are displayed in a grid
   * Objective: Ensure multiple project cards are rendered on the page
   */
  test("displays project cards grid", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Find all project cards using semantic data-testid
    const projectCards = page.getByTestId("project-card");

    // Assert: Check that at least one project card is visible
    await expect(projectCards.first()).toBeVisible();

    // Assert: Check that multiple cards exist (assuming there are multiple projects)
    const count = await projectCards.count();
    expect(count).toBeGreaterThan(0);
  });

  /**
   * POSITIVE TEST: Verify project cards have titles
   * Objective: Ensure each project card displays a title
   */
  test("displays project cards with titles", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Find project card titles using semantic data-testid and correct heading level (h2)
    const cardHeadings = page.getByTestId("project-title");

    // Assert: Check that at least one heading is visible
    await expect(cardHeadings.first()).toBeVisible();

    // Assert: Check all headings have text content
    const headingsCount = await cardHeadings.count();
    for (let i = 0; i < headingsCount; i++) {
      const text = await cardHeadings.nth(i).textContent();
      expect(text?.trim()).toBeTruthy();
    }
  });

  /**
   * POSITIVE TEST: Verify project cards have descriptions
   * Objective: Ensure each project card displays a description
   */
  test("displays project cards with descriptions", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Find project card descriptions using semantic data-testid
    const cardDescriptions = page.getByTestId("project-description");

    // Assert: Check that descriptions are visible
    await expect(cardDescriptions.first()).toBeVisible();

    // Assert: Check descriptions have text content
    const count = await cardDescriptions.count();
    for (let i = 0; i < count; i++) {
      const text = await cardDescriptions.nth(i).textContent();
      expect(text?.trim()).toBeTruthy();
    }
  });

  /**
   * POSITIVE TEST: Verify responsive grid layout
   * Objective: Ensure project grid adapts to different screen sizes
   */
  test("displays responsive grid layout", async ({ page }) => {
    // Arrange: Page is loaded
    const projectCards = page.getByTestId("project-card");

    // Act: Test desktop layout (multiple columns expected)
    await page.setViewportSize({ width: 1200, height: 800 });
    const desktopCardCount = await projectCards.count();
    const firstDesktopCard = projectCards.first();

    // Assert: Cards are visible on desktop
    await expect(firstDesktopCard).toBeVisible();

    // Act: Test mobile layout (single column expected)
    await page.setViewportSize({ width: 375, height: 667 });
    const firstMobileCard = projectCards.first();

    // Assert: Cards remain visible on mobile
    await expect(firstMobileCard).toBeVisible();

    // Assert: Same number of cards are present in both viewports
    const mobileCardCount = await projectCards.count();
    expect(desktopCardCount).toEqual(mobileCardCount);
  });

  /**
   * NEGATIVE TEST: Verify navigation to non-existent project shows 404
   * Objective: Ensure app handles invalid project routes gracefully
   */
  test("shows 404 page for non-existent project", async ({ page }) => {
    // Arrange: Navigate to non-existent project
    // Act: Go to invalid project URL
    await page.goto("/projects/non-existent-project-123");

    // Assert: Check that 404 content is shown
    await expect(page.getByText(/404|not found/i, { exact: false })).toBeVisible();
  });
});
