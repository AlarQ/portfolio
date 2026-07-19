import { expect, test } from "@playwright/test";
import {
  type StorybookStaticServer,
  startStorybookStaticServer,
} from "./support/storybookStaticServer";

/**
 * Task 007 acceptance row 5 / coverage finding coverage-1: proves the
 * `Pages/Home` story actually reflows at the Figma "iPhone 15" mobile frame
 * (390x844) - a REAL browser viewport resize + REAL computed-style check,
 * not just an assertion that a `parameters.viewport` object exists (which
 * `@storybook/addon-viewport` isn't installed to consume, so that parameter
 * has no rendering effect). This test sets the actual Playwright viewport to
 * 390x844 and asserts the post grid's real `grid-template-columns` collapses
 * to a single column, then re-checks at a desktop width that it expands to
 * two columns - so a broken mobile reflow (e.g. an accidentally removed
 * `sm:` breakpoint) fails this test.
 */
let storybookServer: StorybookStaticServer;

test.beforeAll(async () => {
  storybookServer = await startStorybookStaticServer("storybook-e2e-viewport-");
});

test.afterAll(async () => {
  await storybookServer.close();
});

test("Pages/Home post grid collapses to one column at the iPhone 15 mobile width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${storybookServer.baseUrl}/iframe.html?id=pages-home--default&viewMode=story`);

  const grid = page.locator(".grid").first();
  await expect(grid).toBeVisible();

  const mobileColumnCount = await grid.evaluate(
    (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length
  );
  expect(mobileColumnCount).toBe(1);

  await page.setViewportSize({ width: 1024, height: 800 });
  // Tailwind's `sm:` breakpoint is a pure CSS media query - no reload needed,
  // the browser recomputes styles on viewport resize.
  const desktopColumnCount = await grid.evaluate(
    (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length
  );
  expect(desktopColumnCount).toBe(2);
});
