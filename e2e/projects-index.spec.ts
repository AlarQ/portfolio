import { expect, test } from "@playwright/test";
import { projects } from "@/data/projects";

/**
 * `/projects` index E2E (projects-tab FR-4, FR-11). Chunk-1 behaviors:
 *
 *  1. projects_link_lands_on_route_active_state_highlights — the site nav's
 *     Projects link routes to `/projects` (previously a 404) and the Header
 *     marks it active there.
 *  2. sticky_strip_above_summary_first_pill_selected_projects_order — the
 *     sticky `ProjectTabStrip` renders above a full-width `ProjectSummary`,
 *     pills follow `src/data/projects.ts` array order, and `projects[0]` is
 *     selected on load with no interaction.
 *  3. pill_click_swaps_summary_client_side_no_navigation — clicking a
 *     non-active pill swaps the summary entirely client-side (URL unchanged).
 *
 * Scoped to chromium — the webkit/mobile suites have known pre-existing
 * failures (profile-card heading mismatch); chromium is the reliable signal.
 * `getByRole("link", { name: "Projects", exact: true })` disambiguates the
 * desktop nav link from the brand logo and the hidden mobile <nav>.
 */
test.describe("Projects index", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test("nav Projects link lands on /projects and Header marks it active", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Projects", exact: true }).click();

    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("renders the sticky pill strip above the summary with the first pill selected", async ({
    page,
  }) => {
    await page.goto("/projects");

    const tablist = page.getByRole("tablist", { name: "Projects" });
    await expect(tablist).toBeVisible();

    // Pills follow projects.ts array order.
    const tabs = tablist.getByRole("tab");
    await expect(tabs).toHaveCount(projects.length);
    for (let i = 0; i < projects.length; i++) {
      await expect(tabs.nth(i)).toHaveText(new RegExp(projects[i].title));
    }

    // First pill is selected on load with no interaction (projects[0]).
    const firstTab = page.getByRole("tab", { name: new RegExp(projects[0].title) });
    await expect(firstTab).toHaveAttribute("aria-selected", "true");

    // The strip sits above the full-width summary panel.
    const summary = page.getByRole("tabpanel");
    await expect(summary).toBeVisible();
    const stripBox = await tablist.boundingBox();
    const summaryBox = await summary.boundingBox();
    expect(stripBox).not.toBeNull();
    expect(summaryBox).not.toBeNull();
    expect(stripBox?.y ?? 0).toBeLessThan(summaryBox?.y ?? 0);
  });

  test("clicking another pill swaps the summary client-side without navigating", async ({
    page,
  }) => {
    test.skip(projects.length < 2, "needs at least two Projects to exercise a pill swap");

    await page.goto("/projects");

    const secondTitle = projects[1].title;
    const secondTab = page.getByRole("tab", { name: new RegExp(secondTitle) });

    let navigated = false;
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) navigated = true;
    });

    await secondTab.click();

    await expect(secondTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText(secondTitle);
    // No full navigation / reload: URL stays on /projects.
    await expect(page).toHaveURL(/\/projects$/);
    expect(navigated).toBe(false);
  });
});
