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
  // index-lists-posts + index-item-shows-meta (FR-1): the published Post
  // surfaces on /blog as a navigable card exposing title, dek, date, and
  // reading time. (The bare "title link is visible" assertion is folded in
  // here via getByRole("link") rather than kept as a separate test.)
  test("lists the published Post with its title link, dek, date, and reading time", async ({
    page,
  }) => {
    await page.goto("/blog");

    // The card is wrapped in a navigable link (an ancestor of the testid'd
    // content), so assert the link at page scope and the metadata within the item.
    await expect(page.getByRole("link", { name: /Bounded Chaos/ })).toBeVisible();

    const item = page.getByTestId("featured-post");
    await expect(item.getByText("Bounded Chaos")).toBeVisible();
    await expect(item.getByText(/deterministic containment vessel/)).toBeVisible();
    // Assert the machine-readable ISO date (locale-proof) plus a loose check
    // that a human-formatted date renders — not the exact localized string.
    const date = item.locator("time");
    await expect(date).toHaveAttribute("datetime", "2026-06-15");
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
    await page.goto("/blog");

    await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
  });

  // nav-blog-present (FR-7): Blog appears in the mobile drawer
  test("shows a Blog entry in the mobile drawer", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/blog");

    await page.click('button[aria-label="Open menu"]');
    await page.waitForTimeout(500);

    await expect(page.locator('#mobile-menu a[href="/blog"]')).toBeVisible();
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
  // PostReadingLayout ToC grid — not a raw per-component literal.
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
  // Sample the ACTUALLY-RENDERED colors — the resolved computed `color` of the
  // rendered code text and the resolved `background-color` of its `<pre>` — not
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

    // Drive focus directly — reliable on chromium, webkit, and Mobile Safari.
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
  // reduce — a computed-style sample is racy (observed opacity ~0.08 mid-ramp).
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
