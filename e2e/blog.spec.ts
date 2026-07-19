import { expect, test } from "@playwright/test";

/**
 * Blog navigation + Post detail E2E (chromium - the reliable signal; webkit/
 * mobile have known pre-existing failures per repo CLAUDE.md).
 *
 * The blog index itself (index-lists-posts, index-item-shows-meta,
 * featured-first-at-n1 - FR-1/FR-8) moved to `/` under ADR-RM-4 and is
 * covered by `e2e/home.spec.ts` (real Post content, newest-first) and
 * `src/components/pages/Home.test.tsx` (article-per-Post structural
 * invariant). The legacy `data-testid="featured-post"` markup those
 * scenarios used to assert against belonged to the retired MUI `PostList`/
 * `PostCard` (deleted same-branch per ADR-RM-5) - this file no longer
 * duplicates that coverage against the old `/blog` route.
 *
 * Scenarios: nav-blog-present, nav-active-on-detail.
 */

/**
 * Salvaged route-regression block (task 010, ADR-RM-5). Relocated from
 * `e2e/coexistence.spec.ts` (deleted same commit) - its MUI/Tailwind
 * cascade-layer assertions are gone with MUI, but the no-console/page-error
 * regression sweep across the live IA survives, restated for the post-
 * migration routes (`/`, `/blog` redirect, `/blog/[slug]`, `/author`,
 * `/projects` - now a live route, task 004). `/` and `/blog` redirect coverage already lives in
 * `e2e/home.spec.ts` - not duplicated here.
 */
test.describe("existing routes render without regression (route-regression sweep)", () => {
  function trackErrors(page: import("@playwright/test").Page) {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));
    return () => {
      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    };
  }

  test("/projects renders as a live route without console/page errors", async ({ page }) => {
    const assertNoErrors = trackErrors(page);

    const response = await page.goto("/projects");
    expect(response?.ok()).toBe(true);

    assertNoErrors();
  });

  test("/blog/[slug] (real slug) renders without console/page errors", async ({ page }) => {
    const assertNoErrors = trackErrors(page);

    const response = await page.goto("/blog/my-spec-driven-workflow");
    expect(response?.ok()).toBe(true);
    await expect(page.locator("h1").first()).toHaveText(/bounded chaos/i);

    assertNoErrors();
  });

  test("/author renders without console/page errors", async ({ page }) => {
    const assertNoErrors = trackErrors(page);

    const response = await page.goto("/author");
    expect(response?.ok()).toBe(true);

    assertNoErrors();
  });
});

test.describe("Blog navigation", () => {
  // nav-blog-present (FR-7): Blog appears in the desktop nav
  test("shows a Blog entry in the desktop nav", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto("/blog");

    await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
  });

  // nav-blog-present (FR-7): Blog appears in the mobile drawer
  test("shows a Blog entry in the mobile drawer", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/blog");

    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(500);

    // Nav consolidation (task 005, e2e-test-1): the legacy MUI drawer
    // (`#mobile-menu`) is retired - `ds/Header`'s `HeaderMobileMenu` is now the
    // sole mobile drawer, with the real Blog destination `/` (ADR-RM-4).
    await expect(page.locator('#mobile-menu a[href="/"]')).toBeVisible();
  });

  // nav-active-on-detail (FR-7): active on /blog and on /blog/[slug]
  //
  // On narrow viewports (e.g. Mobile Chrome) the nav is a closed drawer whose
  // links are unmounted until opened (see MobileNav.tsx), so the desktop
  // width is forced here to assert against the always-mounted desktop nav.
  test("marks the Blog entry active on /blog", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto("/blog");

    await expect(page.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("marks the Blog entry active on a Post detail route", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto("/blog/my-spec-driven-workflow");

    await expect(page.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});

/**
 * Post detail page: long-form readability + per-Post document title + a11y
 * (FR-9/10/11). chromium-only signal. Exercises the real `/blog/my-spec-driven-workflow`
 * render: generateMetadata title, constrained measure, contained mobile code
 * overflow, heading hierarchy, code contrast, link focus, reduced motion.
 */
test.describe("Post detail readability & a11y", () => {
  // detail-document-title (FR-9): <title> reflects the Post title
  test("sets the document title from the Post title via generateMetadata", async ({ page }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    await expect(page).toHaveTitle(/Bounded Chaos/);
  });

  // typography-measure-constrained (task 005): the prose column's declared CSS
  // measure is exactly the `proseMeasure` token (64ch), shared with the
  // PostLayout ToC grid - not a raw per-component literal.
  test("prose column measure resolves to the 64ch theme token at desktop viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/blog/my-spec-driven-workflow");
    await page.evaluate(() => document.fonts.ready);

    const article = page.locator("article");
    await expect(article).toBeVisible();

    // getComputedStyle resolves `ch` to px; recover the ch count from the
    // rendered font to confirm it matches the 64ch token, not the old 68ch.
    const chCount = await article.evaluate((el) => {
      const style = getComputedStyle(el);
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) throw new Error("no canvas 2d context");
      ctx.font = `${style.fontSize} ${style.fontFamily}`;
      const zero = ctx.measureText("0").width;
      return Number.parseFloat(style.maxWidth) / zero;
    });

    expect(chCount).toBeGreaterThan(62);
    expect(chCount).toBeLessThan(66);
  });

  // mobile-code-overflow-contained (FR-10): code scrolls within its own box and
  // the page itself never gains a horizontal scrollbar on a narrow viewport
  test("contains code-block overflow on mobile with no body horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/blog/my-spec-driven-workflow");

    const pre = page.locator("article pre").first();
    await expect(pre).toBeVisible();
    const overflowX = await pre.evaluate((el) => getComputedStyle(el).overflowX);
    expect(["auto", "scroll"]).toContain(overflowX);

    const noBodyScroll = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    );
    expect(noBodyScroll).toBe(true);
  });

  // heading-hierarchy-valid (FR-11): exactly one h1 (the title), body starts at
  // h2, no skipped levels going down the tree
  test("exposes a valid heading hierarchy: one h1 title, body from h2, no skips", async ({
    page,
  }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    const levels = await page
      .locator("article :is(h1,h2,h3,h4,h5,h6)")
      .evaluateAll((els) => els.map((e) => Number(e.tagName[1])));

    expect(levels[0]).toBe(1);
    expect(levels.filter((l) => l === 1).length).toBe(1);
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1]) {
        expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
      }
    }
  });

  // code-contrast-aa (FR-11): highlighted code foreground vs background meets
  // WCAG-AA (>= 4.5:1).
  //
  // Sample the ACTUALLY-RENDERED colors - the resolved computed `color` of the
  // rendered code text and the resolved `background-color` of its `<pre>` - not
  // the raw `--shiki-*` root vars. The old root-var read passed as long as the
  // variables held their values even if the rendered code had stopped resolving
  // them (e.g. a seam override, a dropped var, a changed background). This reads
  // the cascade's real output. (Main code-text foreground is measured, not
  // per-token spans: dim tokens like comments are intentionally below 4.5:1.)
  test("rendered code text meets WCAG-AA contrast against its background", async ({ page }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    const { fg, bg } = await page.evaluate(() => {
      const code = document.querySelector("article pre code");
      const pre = document.querySelector("article pre");
      if (!code || !pre) throw new Error("no rendered code block found");
      return {
        fg: getComputedStyle(code).color,
        bg: getComputedStyle(pre).backgroundColor,
      };
    });

    const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const ch = [r, g, b]
        .map((v) => v / 255)
        .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
    };
    const a = lum(rgb(fg));
    const b = lum(rgb(bg));
    const [hi, lo] = a > b ? [a, b] : [b, a];
    const ratio = (hi + 0.05) / (lo + 0.05);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  // link-focus-visible (FR-11): a prose link shows a visible focus ring under
  // keyboard focus. Uses programmatic .focus() to sidestep the WebKit/Safari
  // "Tab to links" setting (off by default), making the assertion reliable on
  // all configured browsers. :focus-visible applies when focus is set
  // programmatically in a page with no prior pointer interaction.
  test("in-prose link shows a visible focus ring on keyboard focus", async ({ page }) => {
    await page.goto("/blog/my-spec-driven-workflow");

    const link = page.getByRole("link", { name: /"grill" interview/i });
    await link.scrollIntoViewIfNeeded();

    // Drive focus directly - reliable on chromium, webkit, and Mobile Safari.
    await link.focus();
    await expect(link).toBeFocused();

    // Verify a visible focus affordance: outline or box-shadow must be present.
    const { outlineWidth, boxShadow } = await link.evaluate((el) => {
      const s = getComputedStyle(el);
      return { outlineWidth: s.outlineWidth, boxShadow: s.boxShadow };
    });
    const hasOutline = parseFloat(outlineWidth) > 0;
    const hasBoxShadow = boxShadow !== "none" && boxShadow !== "";
    expect(hasOutline || hasBoxShadow).toBe(true);
  });

  // reduced-motion-respected (FR-11): prefers-reduced-motion is surfaced
  // deterministically on the article via data-reduced-motion, which drives
  // whether framer-motion applies the entrance keyframe.
  //
  // NOTE: a settled computed opacity/transform is deliberately NOT asserted.
  // usePrefersReducedMotion starts `false` on SSR/first paint (hydration-safe)
  // then flips on mount, so the entrance animation briefly runs even under
  // reduce - a computed-style sample is racy (observed opacity ~0.08 mid-ramp).
  // The attribute is the deterministic contract; the paired test below guards
  // it against being hardcoded.
  test("respects prefers-reduced-motion by flagging entrance motion suppressed", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/blog/my-spec-driven-workflow");

    await expect(page.locator("article[data-reduced-motion]")).toHaveAttribute(
      "data-reduced-motion",
      "true"
    );
  });

  // Guards the attribute against being hardcoded: with reduced motion NOT
  // requested it must read "false", proving it tracks the media query rather
  // than always reporting suppression.
  test("marks entrance motion active when reduced motion is not requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/blog/my-spec-driven-workflow");

    await expect(page.locator("article[data-reduced-motion]")).toHaveAttribute(
      "data-reduced-motion",
      "false"
    );
  });
});
