import { expect, test } from "@playwright/test";

/**
 * Blog Post detail E2E Tests
 *
 * Tests the Post detail page at /blog/[slug]
 *
 * Scenario: detail-renders-body (FR-2)
 * - Given an authored Post `my-spec-driven-workflow`
 * - When a reader visits /blog/my-spec-driven-workflow
 * - Then the MDX body renders as HTML in the statically generated page
 */

test.describe("Blog Post detail", () => {
  test("renders the authored MDX body as HTML", async ({ page }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    // A distinctive sentence from the MDX body appears as rendered text.
    const bodyProse = page.getByText(
      "The job is never finished, because the boundary keeps moving.",
      {
        exact: false,
      }
    );
    await expect(bodyProse).toBeVisible();
  });

  /**
   * REGRESSION GUARD: the `---` frontmatter block must NOT render in the body.
   * Without `remark-frontmatter` in the MDX pipeline (next.config.ts), the
   * leading `---...---` block renders as a thematic break (<hr>) plus raw
   * `title:/dek:/date:` text atop every Post. This pins the body to start at the
   * authored prose — the unit suite can't cover it (Next compiles the body, not
   * the loader). See reports/architecture-data.md finding 1.
   */
  test("does not leak raw frontmatter into the rendered body", async ({ page }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    // The raw `date:` frontmatter line is absent (the body shows the formatted
    // date, never the ISO source line), and no thematic break stands in for the
    // stripped `---...---` block.
    await expect(page.getByText("date: 2026-06-15", { exact: false })).toHaveCount(0);
    await expect(page.locator("article hr")).toHaveCount(0);
  });

  /**
   * REGRESSION GUARD: pre-rendered Mermaid diagrams ship as committed SVGs.
   * The Vercel browserless-build fix replaced in-build `rehype-mermaid` (which
   * launched headless Chromium during `next build`) with a pre-commit step that
   * renders `content/diagrams/*.mmd` → `public/diagrams/*.svg`, referenced from
   * the Post body via the `<Diagram>` component (src/components/Diagram.tsx).
   * This pins the rendered contract: four `<img src="/diagrams/*.svg">` with
   * non-empty alt text, and — crucially — each SVG actually resolves (200), so
   * a missing/unbuilt diagram fails here instead of silently 404-ing in prod.
   */
  test("renders pre-rendered Mermaid diagrams as resolvable SVG images", async ({ page }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    const names = ["feature-flow", "task-states", "validate-panel", "learning-loop"];
    for (const name of names) {
      const img = page.locator(`article img[src="/diagrams/${name}.svg"]`);
      await expect(img).toHaveCount(1);
      // Non-empty alt: the diagram carries an accessible description, not an empty box.
      expect((await img.getAttribute("alt")) ?? "").not.toBe("");
      // The committed SVG actually exists and serves (the whole point of the fix).
      const res = await page.request.get(`/diagrams/${name}.svg`);
      expect(res.status()).toBe(200);
    }
  });

  /**
   * NEGATIVE TEST: unknown slug returns the not-found response (FR-2)
   * Scenario: detail-unknown-slug-404
   * - Given no Post file maps to slug `does-not-exist`
   * - When a reader visits /blog/does-not-exist
   * - Then the site returns its not-found response and no Post is rendered
   *
   * generateStaticParams maps the loader output; a slug not in that set is not
   * pre-rendered (dynamicParams=false) and resolves to the 404 response.
   */
  test("returns the not-found response for a slug not in the Post set", async ({ page }) => {
    const response = await page.goto("/blog/does-not-exist");

    expect(response?.status()).toBe(404);
  });
});
