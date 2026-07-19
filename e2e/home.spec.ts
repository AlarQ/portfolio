import { expect, test } from "@playwright/test";

/**
 * FR-1 (`home-index-renders`). `/` now serves the Blog index (ADR-RM-4:
 * inverted IA) fed by the real Post loader over `content/posts/`
 * (`my-spec-driven-workflow.mdx`, `second-post.mdx`). Asserts real content +
 * newest-first ordering only - theme/light-default is asserted by a later
 * task (006), badge-hue correctness by an earlier one.
 */
test.describe("/ renders the Blog index (FR-1)", () => {
  test("renders real Post titles/deks newest first", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    const articles = page.locator("article");
    await expect(articles).toHaveCount(2);

    // `content/posts/my-spec-driven-workflow.mdx` is dated after
    // `second-post.mdx` - newest-first means it renders first.
    const firstArticleText = await articles.nth(0).innerText();
    const secondArticleText = await articles.nth(1).innerText();

    expect(firstArticleText).toContain("Bounded Chaos");
    expect(firstArticleText).toContain("You can't make an LLM deterministic");
    expect(secondArticleText).toContain("The Seam Pattern");
  });

  test("/blog 308-redirects to / and renders without regression", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const response = await page.goto("/blog");
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("h1").first()).toHaveText(/cold take/i);

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
