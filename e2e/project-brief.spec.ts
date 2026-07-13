import { expect, test } from "@playwright/test";

/**
 * Project Brief detail E2E test (task 005, FR-8/FR-9).
 *
 * Scenario: brief-renders-mdx
 * - Given a Project with slug `s` has a matching `content/projects/s.mdx` body
 * - When a reader visits /projects/s
 * - Then the Brief renders the Project's title and MDX body through the
 *   existing `mdxPresentation` seam (shared with the Blog — no second render
 *   path/component map), and the document `<title>` reflects the Project.
 */

test.describe("Project Brief detail", () => {
  test("renders the Project title and MDX body via the existing mdxPresentation seam", async ({
    page,
  }) => {
    await page.goto("/projects/portfolio-site");

    await expect(page.getByRole("heading", { level: 1, name: "Portfolio Site" })).toBeVisible();

    // A distinctive sentence from the Brief MDX body appears as rendered text.
    await expect(
      page.getByText(
        "The Projects tab is the newest addition — a tab strip and summary view backed"
      )
    ).toBeVisible();

    // generateMetadata sets a per-Brief <title>.
    await expect(page).toHaveTitle("Portfolio Site");
  });

  /**
   * Scenario: enumerate-not-glob (dynamicParams = false side).
   *
   * Given a slug that is NOT a member of the validated `projects.ts` set,
   * `generateStaticParams` never enumerated a route for it and
   * `dynamicParams = false` blocks Next.js from rendering it on demand —
   * this confirms behavior already implemented in chunk 1 (not newly built
   * here), per task 005's acceptance #2.
   */
  test("a slug outside the validated projects.ts set 404s, never rendered on demand", async ({
    page,
  }) => {
    const response = await page.goto("/projects/does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Portfolio Site" })).not.toBeVisible();
  });

  /**
   * Scenario: orphan-mdx-not-published (FR-9, acceptance #5).
   *
   * Given `content/projects/orphan.mdx` exists on disk with NO matching
   * `projects.ts` entry, `generateStaticParams` never discovers it (it maps
   * only the validated `projects.ts` slug set, never a directory glob), and
   * `dynamicParams = false` blocks it from being rendered on demand either.
   */
  test("an orphan .mdx file with no projects.ts entry is never published", async ({ page }) => {
    const response = await page.goto("/projects/orphan");

    expect(response?.status()).toBe(404);
  });
});

/**
 * Brief MDX body security hardening (FR-8/FR-9, mdx-script-neutralized,
 * external-link-hardened), mirroring `e2e/blog-security.spec.ts` for the
 * shared `mdxPresentation.tsx` seam. Both `<script>`/`<iframe>` and the
 * external-link `rel` hardening are asserted here against the same fixture
 * (`content/projects/portfolio-site.mdx`) already extended with a security
 * block — no second render path, no new component map (ADR-0002): the
 * Brief route inherits the seam's behavior, it is not re-implemented here.
 */
test.describe("Project Brief MDX body security", () => {
  test("external link in the Brief body renders rel=noopener noreferrer and target=_blank", async ({
    page,
  }) => {
    await page.goto("/projects/portfolio-site");

    const external = page.getByRole("link", { name: "an external reference" });
    await expect(external).toBeVisible();
    await expect(external).toHaveAttribute("href", /^https?:\/\//);
    await expect(external).toHaveAttribute("target", "_blank");
    const rel = (await external.getAttribute("rel")) ?? "";
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");
  });

  test("no third-party script or iframe is injected into the Brief article", async ({ page }) => {
    await page.goto("/projects/portfolio-site");

    const thirdPartyScripts = await page
      .locator("article script[src]")
      .evaluateAll((els) =>
        (els as HTMLScriptElement[])
          .map((el) => el.getAttribute("src") ?? "")
          .filter((src) => /^https?:\/\//.test(src))
      );
    expect(thirdPartyScripts).toEqual([]);
    await expect(page.locator("article iframe")).toHaveCount(0);
  });
});
