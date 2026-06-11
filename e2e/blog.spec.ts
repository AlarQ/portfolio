import { expect, test } from "@playwright/test";

/**
 * Blog index + navigation E2E (chromium — the reliable signal; webkit/mobile
 * have known pre-existing failures per repo CLAUDE.md).
 *
 * The featured-first *ordering* invariant (FR-8, N>1) is covered as a unit in
 * `src/components/PostList.test.tsx` — the fs-bound loader yields a single
 * content Post, so e2e exercises the real N=1 render + the loader→page wiring +
 * the single-source nav.
 *
 * Scenarios: index-lists-posts, index-item-shows-meta, featured-first-at-n1,
 * nav-blog-present, nav-active-on-detail.
 */

test.describe("Blog index", () => {
  // index-lists-posts (FR-1): the published Post appears on /blog
  test("lists the published Post", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.getByRole("link", { name: /Hello World/ })).toBeVisible();
  });

  // index-item-shows-meta (FR-1): title, dek, date, and reading time all show
  test("shows each item's title, dek, date, and reading time", async ({ page }) => {
    await page.goto("/blog");

    const item = page.getByTestId("featured-post");
    await expect(item.getByText("Hello World")).toBeVisible();
    await expect(item.getByText(/proving the MDX pipeline end to end/)).toBeVisible();
    // Assert the machine-readable ISO date (locale-proof) plus a loose check
    // that a human-formatted date renders — not the exact localized string.
    const date = item.locator("time");
    await expect(date).toHaveAttribute("datetime", "2026-06-09");
    await expect(date).toHaveText(/\d{1,2} \w+ 20\d{2}/);
    await expect(item.getByText(/min read/)).toBeVisible();
  });

  // featured-first-at-n1 (FR-8): the lone Post fills the featured slot; the
  // section is not empty/abandoned (no empty-state placeholder)
  test("renders the lone Post as the featured item, not an empty section", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.getByTestId("featured-post")).toBeVisible();
    await expect(page.getByTestId("blog-empty")).toHaveCount(0);
  });
});

test.describe("Blog navigation", () => {
  // nav-blog-present (FR-7): Blog appears in the desktop nav
  test("shows a Blog entry in the desktop nav", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
  });

  // nav-blog-present (FR-7): Blog appears in the mobile drawer
  test("shows a Blog entry in the mobile drawer", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(500);

    await expect(page.locator('#mobile-menu a[href="/blog"]')).toBeVisible();
  });

  // nav-active-on-detail (FR-7): active on /blog and on /blog/[slug]
  test("marks the Blog entry active on /blog", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.locator('nav a[href="/blog"]').first()).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("marks the Blog entry active on a Post detail route", async ({ page }) => {
    await page.goto("/blog/hello-world");

    await expect(page.locator('nav a[href="/blog"]').first()).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
