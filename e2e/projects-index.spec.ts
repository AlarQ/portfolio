import { expect, test } from "@playwright/test";
import { getProjects } from "@/data/projects";

/**
 * `/projects` index E2E (projects-detail FR-7, FR-14). Scenarios:
 *
 *  1. nav Projects link routes to `/projects` and `Header` marks it active.
 *  2. cards render one per Project, in `getProjects()` array order
 *     (array-order-authoritative), each with a Milestone Progress figure and
 *     a link to its detail route - no meter/`progressbar`, no `tablist`.
 *  3. the FR-14 intro copy is present.
 *
 * Scoped to chromium - the webkit/mobile suites have known pre-existing
 * failures (profile-card heading mismatch); chromium is the reliable signal.
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

  test("renders one card per Project in array order, with a figure and a link to its detail route", async ({
    page,
  }) => {
    const projects = getProjects();
    await page.goto("/projects");

    for (const project of projects) {
      const link = page.getByRole("link", { name: project.title });
      await expect(link).toHaveAttribute("href", `/projects/${project.slug}`);
    }

    // Cards render in getProjects() array order (array-order-authoritative).
    const cardLinks = page.locator('[data-slot="card-title"] a');
    await expect(cardLinks).toHaveCount(projects.length);
    for (let i = 0; i < projects.length; i++) {
      await expect(cardLinks.nth(i)).toHaveAttribute("href", `/projects/${projects[i].slug}`);
    }

    const figures = page.locator('[data-slot="milestone-figure"]');
    await expect(figures).toHaveCount(projects.length);
    const figureTexts = await figures.allTextContents();
    for (const text of figureTexts) {
      expect(text).toMatch(/\d+% to |reached/);
    }
  });

  test("has no tablist and no progressbar on the index", async ({ page }) => {
    await page.goto("/projects");

    await expect(page.getByRole("tablist")).toHaveCount(0);
    await expect(page.getByRole("progressbar")).toHaveCount(0);
  });

  test("shows the FR-14 intro copy", async ({ page }) => {
    await page.goto("/projects");

    await expect(
      page.getByText(
        "Projects I'm building right now - what each one lets you do, how far it is toward its next milestone, and how it's built. Open a project for the full brief."
      )
    ).toBeVisible();
  });
});
