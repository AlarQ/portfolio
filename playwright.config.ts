import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  outputDir: "./test-results",
  reporter: [["html", { outputFolder: "./playwright-report" }]],

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  // Local default (`undefined`) spawns one worker per core (~6 here). That
  // oversubscribes CPU when heavier engines (WebKit/Gecko) render the heavy
  // Post-detail page (shiki + Mermaid + fonts) concurrently, pushing the
  // `load` event past navigationTimeout → false timeouts. Cap at 4 so heavy
  // engines don't starve. CI stays serial.
  workers: process.env.CI ? 1 : 4,

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    // Give the server a production-representative absolute origin so build
    // artifacts that must emit absolute URLs (RSS feed, metadataBase) are
    // exercised as they ship — not with the localhost value in `.env.local`.
    // Real `process.env` takes precedence over `.env.local` in Next, so this
    // wins for a Playwright-started server. Falls back to any SITE_URL already
    // set in the shell (e.g. CI).
    env: { SITE_URL: process.env.SITE_URL ?? "https://ernest.dev" },
  },

  use: {
    baseURL: "http://localhost:3000",

    trace: "on-first-retry",

    screenshot: "only-on-failure",

    video: "retain-on-failure",

    actionTimeout: 10 * 1000,

    navigationTimeout: 30 * 1000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
