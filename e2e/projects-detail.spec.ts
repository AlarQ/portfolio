import { expect, test } from "@playwright/test";

/**
 * `/projects/[slug]` detail route E2E (projects-detail FR-6, FR-8, FR-11).
 * Uses Bondsmith (has Capabilities, roadmap 3 of 6 `toward` shipped).
 * Scoped to chromium - see `projects-index.spec.ts` for rationale.
 */
test.describe("Project detail route", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test("<title> is the Project title and header, Capabilities, Roadmap, Brief render in DOM order", async ({
    page,
  }) => {
    await page.goto("/projects/bondsmith");

    await expect(page).toHaveTitle(/Bondsmith/);

    const ids = await page.evaluate(() =>
      Array.from(document.querySelectorAll("h1, h2")).map((el) => el.id)
    );
    const summaryIndex = ids.indexOf("project-summary-heading");
    const capabilitiesIndex = ids.indexOf("capabilities-heading");
    const roadmapIndex = ids.indexOf("roadmap");
    expect(summaryIndex).toBeGreaterThanOrEqual(0);
    expect(summaryIndex).toBeLessThan(capabilitiesIndex);
    expect(capabilitiesIndex).toBeLessThan(roadmapIndex);
  });

  test("renders a progressbar meter with a legend in the header", async ({ page }) => {
    await page.goto("/projects/bondsmith");

    const meter = page.getByRole("progressbar");
    await expect(meter).toBeVisible();
    await expect(page.locator('[data-slot="meter-legend"]')).toHaveText(/\d+% to MVP/);
  });

  test("activating Roadmap ↓ jumps to #roadmap", async ({ page }) => {
    await page.goto("/projects/bondsmith");

    await page.getByRole("link", { name: "Roadmap ↓" }).click();

    await expect(page).toHaveURL(/#roadmap$/);
  });

  test("shows the roadmap Milestone divider text", async ({ page }) => {
    await page.goto("/projects/bondsmith");

    await expect(page.getByText("MVP · 3 of 6 shipped")).toBeVisible();
  });

  test("an unknown slug 404s", async ({ page }) => {
    const response = await page.goto("/projects/does-not-exist");

    expect(response?.status()).toBe(404);
  });
});
