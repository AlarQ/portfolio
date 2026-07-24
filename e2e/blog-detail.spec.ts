import { expect, test } from "@playwright/test";

/**
 * Blog Post detail E2E Tests
 *
 * Tests the Post detail page at /blog/[slug], migrated onto `pages/SinglePost`
 * (route-migration task 004) - asserts against the SinglePost render tree
 * (`ArticleProse`'s `<h1>` + prose, `PageInfo`'s `<time>`), not the retired
 * `PostArticle`/MUI carriers.
 *
 * Scenario: post-page-renders (FR-2)
 * - Given a Post with slug `s` exists
 * - When a reader visits /blog/s
 * - Then pages/SinglePost renders the Post's title, date, and MDX body,
 *   statically generated via generateStaticParams
 */

test.describe("Blog Post detail", () => {
  test("renders the Post title, date, and MDX body via pages/SinglePost", async ({ page }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    // Title: SinglePost -> PostLayout -> ArticleProse's <h1>.
    await expect(page.getByRole("heading", { level: 1, name: "Bounded Chaos" })).toBeVisible();

    // Date: SinglePost -> PostLayout -> PageInfo's <time>, the Post's formatted date.
    await expect(page.locator("time")).toBeVisible();

    // A distinctive sentence from the MDX body appears as rendered text.
    const bodyProse = page.getByText("non-deterministic by construction", {
      exact: false,
    });
    await expect(bodyProse).toBeVisible();
  });

  /**
   * REGRESSION GUARD: the `---` frontmatter block must NOT render in the body.
   * Without `remark-frontmatter` in the MDX pipeline (next.config.ts), the
   * leading `---...---` block renders as a thematic break (<hr>) plus raw
   * `title:/dek:/date:` text atop every Post. This pins the body to start at the
   * authored prose - the unit suite can't cover it (Next compiles the body, not
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
   * REGRESSION GUARD: pre-rendered Excalidraw diagrams ship as committed SVGs.
   * The Vercel browserless-build fix replaced in-build live rendering with a
   * pre-commit step that builds `content/diagrams/*.diagram.ts` →
   * `public/diagrams/*-{light,dark}.svg`, referenced from the Post body via
   * the `<Diagram>` component (src/components/Diagram.tsx). A diagram is a
   * theme-tracking figure: a LIGHT SVG (visible in light mode, carries the
   * accessible description) and a DARK SVG (aria-hidden twin, swapped in via
   * the `.dark` class). This pins the rendered contract: for each of the four
   * diagrams both SVGs render as `<img>` and - crucially - actually resolve
   * (200), so a missing/unbuilt diagram fails here instead of silently
   * 404-ing in prod.
   */
  test("renders pre-rendered Excalidraw diagrams as resolvable light+dark SVG images", async ({
    page,
  }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    const names = ["feature-flow", "task-states", "validate-panel", "learning-loop"];
    for (const name of names) {
      // The light SVG is present but decorative; the accessible name lives on the
      // figure (role="img" + non-empty aria-label), theme-independent.
      const light = page.locator(`article img[src="/diagrams/${name}-light.svg"]`);
      await expect(light).toHaveCount(1);
      const figure = page.locator(`article figure:has(img[src="/diagrams/${name}-light.svg"])`);
      await expect(figure).toHaveAttribute("role", "img");
      expect((await figure.getAttribute("aria-label")) ?? "").not.toBe("");

      // The dark twin is present but hidden from a11y (announced once, not twice).
      const dark = page.locator(`article img[src="/diagrams/${name}-dark.svg"]`);
      await expect(dark).toHaveCount(1);
      await expect(dark).toHaveAttribute("aria-hidden", "true");

      // Both committed SVGs actually exist and serve (the whole point of the fix).
      for (const theme of ["light", "dark"]) {
        const res = await page.request.get(`/diagrams/${name}-${theme}.svg`);
        expect(res.status()).toBe(200);
      }
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

  /**
   * Scenario: post-page-renders (FR-2, acceptance row 5, presence-only per
   * Test Strategist scope narrowing - absent-state degradation is task 005's
   * PostCard ownership).
   * `content/posts/my-spec-driven-workflow.mdx` carries `categories: [AI, Workflow]`
   * - a live fixture exercising the vocabulary-hued category badge row. No
   * published Post currently sets `coverImage`; that render path is covered at
   * the component level (`ArticleProse`/`PostLayout`/`SinglePost` tests).
   */
  test("renders vocabulary-hued category badges when present", async ({ page }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    await expect(page.getByText("AI", { exact: true })).toBeVisible();
    await expect(page.getByText("Workflow", { exact: true })).toBeVisible();
  });
});
