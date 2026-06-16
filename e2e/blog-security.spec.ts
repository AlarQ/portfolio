import { expect, test } from "@playwright/test";

/**
 * Blog MDX body security hardening (FR-5, sec-external-link-rel).
 *
 * The MDX → MUI presentation seam owns Post-body element rendering. Two
 * authoring-safety properties are asserted here against the real rendered page:
 *
 * 1. Every external link in a Post body carries `rel="noopener noreferrer"`
 *    (and opens in a new tab) — reverse-tabnabbing protection applied at the
 *    single seam, not per-author.
 * 2. The MDX body never injects a live third-party `<script>` or iframe into
 *    the document — the seam neither maps nor passes those through.
 */

test.describe("Blog MDX body security", () => {
  test("external link in body renders rel=noopener noreferrer and target=_blank", async ({
    page,
  }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    // The in-prose external link is hardened at the seam.
    const external = page.getByRole("link", { name: '"grill" interview' });
    await expect(external).toBeVisible();
    await expect(external).toHaveAttribute("href", /^https?:\/\//);
    await expect(external).toHaveAttribute("target", "_blank");
    const rel = (await external.getAttribute("rel")) ?? "";
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");
  });

  test("no third-party script or iframe is injected into the article", async ({ page }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    // No live third-party <script> sourced from an external origin is embedded
    // by the Post body. (Next.js framework chunks are same-origin /_next/*.)
    const thirdPartyScripts = await page
      .locator("article script[src]")
      .evaluateAll((els) =>
        (els as HTMLScriptElement[])
          .map((el) => el.getAttribute("src") ?? "")
          .filter((src) => /^https?:\/\//.test(src))
      );
    expect(thirdPartyScripts).toEqual([]);

    // No iframe is injected into the rendered Post body. The seam additionally
    // maps `script`/`iframe` to no-render neutralizers (mdxPresentation.tsx), so
    // even an authored active-content element would be dropped rather than
    // embedded — the protection holds by leverage at the seam, not by absence.
    await expect(page.locator("article iframe")).toHaveCount(0);
  });
});
