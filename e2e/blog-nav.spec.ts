import { expect, test } from "@playwright/test";

/**
 * Prev/next Post navigation E2E (FR-3).
 *
 * `content/posts/` currently holds a single real Post
 * (`my-spec-driven-workflow.mdx` — see task 003 repo-reality note), so this
 * spec covers only the scenario directly exercisable against real content:
 * acceptance #4, the single-Post boundary (neither link renders, no error).
 *
 * The middle-Post (both links) and multi-Post-boundary (one-sided link)
 * scenarios need >=2-3 Posts to exercise meaningfully through a real route;
 * they are covered instead as component-level tests against fixture props in
 * `src/components/PostNav.test.tsx` (see that file's header comment for the
 * rationale — no fixture-content-dir mechanism exists in this repo to inject
 * extra Posts for e2e).
 */

test.describe("Blog Post navigation (single-Post set)", () => {
  test("renders neither a Newer nor an Older link, and no error occurs", async ({ page }) => {
    const response = await page.goto("/blog/my-spec-driven-workflow");
    expect(response?.status()).toBe(200);

    const nav = page.getByRole("navigation", { name: "Post navigation" });
    await expect(nav).toHaveCount(0);
    await expect(page.getByText("Newer post", { exact: false })).toHaveCount(0);
    await expect(page.getByText("Older post", { exact: false })).toHaveCount(0);
  });
});
