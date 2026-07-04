import { expect, test } from "@playwright/test";
import {
  type StorybookStaticServer,
  startStorybookStaticServer,
} from "./support/storybookStaticServer";

/**
 * ADR-DS-1 spike, priority behavior: proves `@storybook/nextjs` mocks both
 * `next/image` and `next/font` at runtime (not just at build time — the
 * scenario explicitly watches for the raw-`<img>`/font-loader console
 * warnings that only surface once the story actually renders in a browser).
 * Runs independently of the shared `webServer` (which serves the live Next
 * app), via the shared static-Storybook harness (`support/storybookStaticServer.ts`).
 */
let storybookServer: StorybookStaticServer;

test.beforeAll(async () => {
  storybookServer = await startStorybookStaticServer("storybook-e2e-build-");
});

test.afterAll(async () => {
  await storybookServer.close();
});

test("next/image and next/font render without missing-mock console warnings", async ({ page }) => {
  const consoleMessages: string[] = [];
  page.on("console", (msg) => consoleMessages.push(msg.text()));

  await page.goto(
    `${storybookServer.baseUrl}/iframe.html?id=atoms-adapterfidelitycard--default&viewMode=story`
  );
  await page.waitForSelector("img");

  const combined = consoleMessages.join("\n");
  expect(combined).not.toMatch(/Image with src .* was detected as the Largest Contentful Paint/i);
  expect(combined).not.toMatch(/next\/font.*fail/i);
  expect(combined).not.toMatch(/was not wrapped in a call to act/i);

  const img = page.locator("img").first();
  await expect(img).toHaveAttribute("src", /next\.svg/);
});
