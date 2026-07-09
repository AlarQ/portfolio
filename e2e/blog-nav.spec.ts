import { expect, test } from "@playwright/test";

/**
 * Prev/next Post navigation E2E (FR-3).
 *
 * `content/posts/` now holds two real Posts — `my-spec-driven-workflow.mdx`
 * (2026-06-15, newest) and `second-post.mdx` (2026-05-20, oldest) — so this spec
 * exercises the multi-Post *boundary* scenario against real content: the newest
 * Post links only to its older neighbour, the oldest only to its newer
 * neighbour, and neither shows a link on its outer edge. (The middle-Post
 * both-links case needs >=3 Posts and stays a component test in
 * `src/components/PostNav.test.tsx`.)
 */

test.describe("Blog Post navigation (multi-Post boundary)", () => {
  test("newest Post links to its older neighbour only (Older, no Newer)", async ({ page }) => {
    const response = await page.goto("/blog/my-spec-driven-workflow");
    expect(response?.status()).toBe(200);

    const nav = page.getByRole("navigation", { name: "Post navigation" });
    await expect(nav).toBeVisible();

    // The older neighbour (second-post) is reachable via an "Older post" link;
    // the newest Post has no newer neighbour.
    await expect(nav.getByRole("link", { name: /Older post/ })).toHaveAttribute(
      "href",
      "/blog/second-post"
    );
    await expect(page.getByText("Newer post", { exact: false })).toHaveCount(0);
  });

  test("oldest Post links to its newer neighbour only (Newer, no Older)", async ({ page }) => {
    const response = await page.goto("/blog/second-post");
    expect(response?.status()).toBe(200);

    const nav = page.getByRole("navigation", { name: "Post navigation" });
    await expect(nav).toBeVisible();

    // The newer neighbour (my-spec-driven-workflow) is reachable via a "Newer
    // post" link; the oldest Post has no older neighbour.
    await expect(nav.getByRole("link", { name: /Newer post/ })).toHaveAttribute(
      "href",
      "/blog/my-spec-driven-workflow"
    );
    await expect(page.getByText("Older post", { exact: false })).toHaveCount(0);
  });
});
