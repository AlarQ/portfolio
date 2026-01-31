import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Testing Configuration
 *
 * Features:
 * - Next.js dev server auto-start on port 3000
 * - Headless mode by default (use --headed for visual debugging)
 * - Parallel execution for faster test runs
 * - Screenshot and trace on failure for debugging
 * - HTML report generation
 * - Mobile viewport configurations for responsive testing
 */
export default defineConfig({
  // Test directory
  testDir: "./e2e",

  // Output directories
  outputDir: "./test-results",
  reporter: [["html", { outputFolder: "./playwright-report" }]],

  // Full configuration mode (recommended for CI)
  fullyParallel: true,

  // Don't fail on single failed test
  forbidOnly: !!process.env.CI,

  // Retries in CI
  retries: process.env.CI ? 2 : 0,

  // Don't run tests in parallel on CI workers
  workers: process.env.CI ? 1 : undefined,

  // Web server configuration
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    timeout: 120 * 1000, // 2 minutes
    reuseExistingServer: !process.env.CI,
  },

  // Base URL for all tests
  use: {
    baseURL: "http://localhost:3000",

    // Collect trace on first retry for debugging
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",

    // Action timeout
    actionTimeout: 10 * 1000, // 10 seconds

    // Navigation timeout
    navigationTimeout: 30 * 1000, // 30 seconds
  },

  // Projects for different viewports/devices
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
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Mobile viewports for responsive testing
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },

    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
});
