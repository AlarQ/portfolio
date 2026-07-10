import { expect, test } from "@playwright/test";

/**
 * FR-1 / ADR-DS-2. Runs against the live app (shared `webServer` in
 * playwright.config.ts) to prove the coexistence tooling landed without MUI
 * losing cascade/reset authority:
 *  - `StyledEngineProvider enableCssLayer` (ThemeProvider.tsx) wraps every
 *    Emotion/MUI style in `@layer mui`, and `globals.css` declares
 *    `@layer theme, utilities, mui;` up front so `mui` — declared last —
 *    wins any cascade tie against Tailwind's `theme`/`utilities` layers
 *    (see ThemeProvider.tsx's ADR-DS-2 implementation note for why this
 *    replaces the ADR's literal `injectFirst` wording on this App Router app).
 *  - MUI `CssBaseline` still resets `body` margin to 0 even though the
 *    Tailwind `theme`/`utilities` layers are also loaded on the page.
 */
test.describe("MUI/Tailwind coexistence (ADR-DS-2)", () => {
  test("MUI styles are wrapped in @layer mui, declared last for cascade priority", async ({
    page,
  }) => {
    await page.goto("/blog");

    const layerEvidence = await page.evaluate(async () => {
      // Order matters here — layer *establishment* order (what decides
      // cascade priority) follows document order of <style>/<link
      // rel="stylesheet"> in <head>, not the order this test happens to read
      // them in. Walk <head> children in DOM order and concatenate in that
      // same order, resolving stylesheet links to their fetched contents.
      const headChildren = Array.from(document.head.children);
      const parts = await Promise.all(
        headChildren.map(async (el) => {
          if (el.tagName === "STYLE") return el.textContent ?? "";
          if (el.tagName === "LINK" && (el as HTMLLinkElement).rel === "stylesheet") {
            return fetch((el as HTMLLinkElement).href).then((res) => res.text());
          }
          return "";
        })
      );
      const combined = parts.join("\n");
      // The build pipeline (Lightning CSS, via Next/Tailwind) collapses the
      // hand-authored bare `@layer theme, utilities, mui;` order statement
      // once `theme`/`utilities` are already established as full `@layer`
      // blocks — it keeps only the trailing `@layer mui;` needed to establish
      // `mui` afterward. CSS layer priority is by first-*establishment*
      // order (a bare `@layer name;` establishes the name), so what actually
      // has to hold is: `theme`/`utilities` are established before `mui`.
      const firstIndex = (layerName: string) =>
        combined.search(new RegExp(`@layer\\s+${layerName}\\b`));
      return {
        hasMuiLayerRule: /@layer\s+mui/.test(combined),
        themeIndex: firstIndex("theme"),
        utilitiesIndex: firstIndex("utilities"),
        muiIndex: firstIndex("mui"),
      };
    });

    expect(layerEvidence.hasMuiLayerRule).toBe(true);
    expect(layerEvidence.themeIndex).toBeGreaterThanOrEqual(0);
    expect(layerEvidence.utilitiesIndex).toBeGreaterThanOrEqual(0);
    expect(layerEvidence.muiIndex).toBeGreaterThan(layerEvidence.themeIndex);
    expect(layerEvidence.muiIndex).toBeGreaterThan(layerEvidence.utilitiesIndex);
  });

  test("CssBaseline resets body margin to 0 (UA default 8px) with Tailwind loaded", async ({
    page,
  }) => {
    await page.goto("/blog");

    // The user-agent default is `body { margin: 8px }` on all sides. Tailwind
    // preflight is disabled and `globals.css` never sets a body margin, so the
    // ONLY thing zeroing it here is MUI `CssBaseline` (emitted under
    // `@layer mui`). Asserting all four sides are 0 therefore fails if
    // CssBaseline is removed — the margin would revert to the 8px UA default,
    // which a single `marginTop` read against a coincidental 0 could miss.
    const margins = await page.evaluate(() => {
      const s = getComputedStyle(document.body);
      return [s.marginTop, s.marginRight, s.marginBottom, s.marginLeft];
    });

    expect(margins).toEqual(["0px", "0px", "0px", "0px"]);
  });
});

/**
 * FR-1 (`tooling-coexists-no-regression`, `build_succeeds_and_existing_routes_render_unchanged`).
 * Exercises every existing route with the coexistence tooling landed and
 * asserts each still renders without regression. `/` and `/projects` don't
 * carry their own content today — `/` config-redirects to `/blog`
 * (`next.config.ts`) and `/projects` is an intentional 404 (`navItems.ts`) —
 * so "unchanged" for those two means the redirect/404 behavior itself still
 * holds, not that they render blog-like content. `/blog` and a real
 * `/blog/[slug]` are asserted against their actual identifying content.
 * Chromium only: webkit/mobile suites carry known pre-existing failures
 * unrelated to this change (CLAUDE.md), so scoping this claim to those
 * engines would produce a false regression signal instead of a real one.
 */
test.describe("existing routes render without regression (FR-1)", () => {
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

  test("/projects remains an intentional 404, no regression to a live route", async ({ page }) => {
    const response = await page.goto("/projects");
    expect(response?.status()).toBe(404);
  });

  test("/blog renders without console/page errors", async ({ page }) => {
    const assertNoErrors = trackErrors(page);

    const response = await page.goto("/blog");
    expect(response?.ok()).toBe(true);
    await expect(page.locator("h1").first()).toHaveText(/blog/i);

    assertNoErrors();
  });

  test("/blog/[slug] (real slug) renders without console/page errors", async ({ page }) => {
    const assertNoErrors = trackErrors(page);

    const response = await page.goto("/blog/my-spec-driven-workflow");
    expect(response?.ok()).toBe(true);
    await expect(page.locator("h1").first()).toHaveText(/bounded chaos/i);

    assertNoErrors();
  });
});
