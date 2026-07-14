import { expect, test } from "@playwright/test";

/**
 * Project Brief detail E2E (task 005, FR-8/FR-9) — enumerate-not-glob guard.
 *
 * No Project currently ships a `content/projects/<slug>.mdx` body, so the
 * Brief-having set is empty and `/projects/[slug]` publishes zero routes.
 * `generateStaticParams` maps only the validated `projects.ts` Brief-having set
 * (never a directory glob over `content/projects/`), and `dynamicParams = false`
 * blocks on-demand rendering — so every slug 404s, including an orphan `.mdx`
 * that exists on disk with no matching `projects.ts` entry.
 *
 * The shared `mdxPresentation` seam's security hardening (external-link `rel`,
 * `<script>`/`<iframe>` neutralization) stays covered by `e2e/blog-security.spec.ts`
 * against the same seam — no Brief fixture is needed to exercise it.
 */

test.describe("Project Brief detail", () => {
  test("a slug outside the validated projects.ts set 404s, never rendered on demand", async ({
    page,
  }) => {
    const response = await page.goto("/projects/does-not-exist");

    expect(response?.status()).toBe(404);
  });

  test("an orphan .mdx file with no projects.ts entry is never published", async ({ page }) => {
    const response = await page.goto("/projects/orphan");

    expect(response?.status()).toBe(404);
  });
});
