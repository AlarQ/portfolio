import { expect, test } from "@playwright/test";

/**
 * Homepage E2E Tests
 *
 * Tests the main landing page at /
 *
 * Features tested:
 * - Page loads successfully
 * - ProfileCard displays correct name and bio
 * - HeroContent displays correct title and stats
 * - Social links are present
 * - Topic and reading sections render
 * - GitHub contribution graph loads (with Suspense)
 */

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");
  });

  /**
   * POSITIVE TEST: Verify homepage loads successfully
   * Objective: Ensure the homepage is accessible and renders correctly
   */
  test("loads successfully and displays correct page title", async ({ page }) => {
    // Arrange: Page is loaded from beforeEach
    // Act: Page already navigated in beforeEach
    // Assert: Check page title exists
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  /**
   * POSITIVE TEST: Verify profile card displays correct information
   * Objective: Ensure ProfileCard component renders with correct name and bio
   */
  test("displays profile card with correct name and bio", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Wait for profile card heading to be visible (heading level 1 in profile card)
    const profileCardHeading = page.getByRole("heading", { name: "Ernest Bednarczyk", level: 1 });
    await expect(profileCardHeading).toBeVisible();

    // Assert: Check name is displayed in heading
    await expect(profileCardHeading).toHaveText("Ernest Bednarczyk");

    // Assert: Check bio is present (partial match)
    const bio = page.getByText("Engineering Team Leader");
    await expect(bio).toBeVisible();
    await expect(bio).toContainText("6+ years of commercial software development");
  });

  /**
   * POSITIVE TEST: Verify hero content displays correct title
   * Objective: Ensure HeroContent component renders with "ENGINEERING" title
   */
  test("displays hero content with correct title", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Find hero title by role (heading with h1)
    const heroTitle = page.getByRole("heading", { name: "ENGINEERING", level: 1 });

    // Assert: Check title is visible
    await expect(heroTitle).toBeVisible();
  });

  /**
   * POSITIVE TEST: Verify only one h1 heading exists on the page
   * Objective: Ensure proper heading hierarchy for accessibility
   */
  test("has exactly one h1 heading for accessibility", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Find all h1 headings
    const h1Headings = page.getByRole("heading", { level: 1 });

    // Assert: Check that only one h1 exists
    await expect(h1Headings).toHaveCount(1);
  });

  /**
   * POSITIVE TEST: Verify hero content displays subtitle
   * Objective: Ensure HeroContent component renders with correct subtitle as h2
   */
  test("displays hero content with correct subtitle", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Find hero subtitle by role (heading with h2 - not h1 to maintain proper hierarchy)
    const heroSubtitle = page.getByRole("heading", { name: "TEAM LEADER", level: 2 });

    // Assert: Check subtitle is visible
    await expect(heroSubtitle).toBeVisible();
  });

  /**
   * POSITIVE TEST: Verify stats are displayed
   * Objective: Ensure experience stats are rendered correctly
   */
  test("displays experience stats", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Wait for stats to be visible using proper waiting strategy
    const yearsOfExperience = page.getByText("Years of Experience");
    await expect(yearsOfExperience).toBeVisible();

    // Assert: Check stats sections are present
    await expect(yearsOfExperience).toBeVisible();

    const engineersLed = page.getByText("Engineers Led");
    await expect(engineersLed).toBeVisible();

    const yearsLeadingTeams = page.getByText("Years Leading Teams");
    await expect(yearsLeadingTeams).toBeVisible();
  });

  /**
   * POSITIVE TEST: Verify services are displayed
   * Objective: Ensure service cards with Backend Development and Leadership are present
   */
  test("displays service cards", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Find service cards using semantic selectors
    const backendService = page.getByText("Backend Development");
    await expect(backendService).toBeVisible();

    // Assert: Check backend development service
    await expect(backendService).toBeVisible();
    await expect(backendService).toContainText("Scala, Rust, Microservices");

    // Assert: Check leadership service
    const leadershipService = page.getByText("Leadership & Management");
    await expect(leadershipService).toBeVisible();
    await expect(leadershipService).toContainText("Team Growth, Delivery");
  });

  /**
   * POSITIVE TEST: Verify social links are present
   * Objective: Ensure LinkedIn and GitHub links are displayed
   */
  test("displays social links", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Find social links by aria-label or role
    const linkedinLink = page.getByRole("link", { name: /LinkedIn/i });
    const githubLink = page.getByRole("link", { name: /GitHub/i });

    // Assert: Check links are present and have correct hrefs
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/ernest-bednarczyk/"
    );

    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute("href", "https://github.com/AlarQ");
  });

  /**
   * POSITIVE TEST: Verify topic section is displayed
   * Objective: Ensure TopicSection renders with the correct topic text
   */
  test("displays topic section", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Find topic section
    const topicSection = page.getByText("Building Development Workflows with Open Code");

    // Assert: Check topic section is visible
    await expect(topicSection).toBeVisible();
  });

  /**
   * POSITIVE TEST: Verify reading section is displayed
   * Objective: Ensure ReadingSection renders and shows current books
   */
  test("displays reading section with actual book titles", async ({ page }) => {
    // Arrange: Page is loaded, known book titles from books.ts
    const bookTitles = ["The Courage To Be Disliked", "OATHBRINGER"];

    // Act & Assert: Check that actual book titles are displayed using proper waiting
    for (const bookTitle of bookTitles) {
      const bookElement = page.getByText(bookTitle, { exact: false });
      await expect(bookElement).toBeVisible();
    }
  });

  /**
   * POSITIVE TEST: Verify GitHub contribution graph loads
   * Objective: Ensure ContributionGraph component renders (may take time due to async Suspense)
   */
  test("displays GitHub contribution graph", async ({ page }) => {
    // Arrange: Page is loaded
    // Act: Wait for contribution graph to load using semantic selector (heading)
    const contributionGraphHeading = page.getByRole("heading", {
      name: "GitHub Contributions",
      level: 2,
    });

    // Assert: Check graph heading becomes visible (give it more time to load for async component)
    await expect(contributionGraphHeading).toBeVisible({ timeout: 15000 });

    // Assert: Check contribution count text is also visible
    const contributionText = page.getByText(/contributions in the last year/i);
    await expect(contributionText).toBeVisible();
  });

  /**
   * NEGATIVE TEST: Verify navigation to non-existent route shows 404
   * Objective: Ensure app handles invalid routes gracefully
   */
  test("shows 404 page for non-existent route", async ({ page }) => {
    // Arrange: Navigate to non-existent route
    // Act: Go to invalid URL
    await page.goto("/this-page-does-not-exist");

    // Assert: Check that 404 content is shown (or Next.js default 404)
    await expect(page.getByText(/404|not found/i, { exact: false })).toBeVisible();
  });
});
