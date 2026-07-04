import { spawnSync } from "node:child_process";
import { createReadStream, existsSync, mkdtempSync, rmSync } from "node:fs";
import type { Server } from "node:http";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { expect, test } from "@playwright/test";

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

/**
 * ADR-DS-1 spike, priority behavior: proves `@storybook/nextjs` mocks both
 * `next/image` and `next/font` at runtime (not just at build time — the
 * scenario explicitly watches for the raw-`<img>`/font-loader console
 * warnings that only surface once the story actually renders in a browser).
 * Runs independently of the shared `webServer` (which serves the live Next
 * app), so it builds a static Storybook output and serves it from an
 * ephemeral local server for the duration of this one test file.
 */
let outDir: string;
let server: Server;
let baseUrl: string;

test.beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), "storybook-e2e-build-"));
  const result = spawnSync("npx", ["storybook", "build", "-o", outDir], { encoding: "utf-8" });
  if (result.status !== 0) {
    throw new Error(`storybook build failed:\n${result.stdout}\n${result.stderr}`);
  }

  server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let filePath = join(outDir, url.pathname === "/" ? "index.html" : url.pathname);
    if (!existsSync(filePath)) filePath = join(outDir, "index.html");
    res.setHeader("Content-Type", MIME[extname(filePath)] ?? "application/octet-stream");
    createReadStream(filePath).pipe(res);
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  baseUrl = `http://localhost:${port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  rmSync(outDir, { recursive: true, force: true });
});

test("next/image and next/font render without missing-mock console warnings", async ({ page }) => {
  const consoleMessages: string[] = [];
  page.on("console", (msg) => consoleMessages.push(msg.text()));

  await page.goto(`${baseUrl}/iframe.html?id=atoms-adapterfidelitycard--default&viewMode=story`);
  await page.waitForSelector("img");

  const combined = consoleMessages.join("\n");
  expect(combined).not.toMatch(/Image with src .* was detected as the Largest Contentful Paint/i);
  expect(combined).not.toMatch(/next\/font.*fail/i);
  expect(combined).not.toMatch(/was not wrapped in a call to act/i);

  const img = page.locator("img").first();
  await expect(img).toHaveAttribute("src", /next\.svg/);
});
