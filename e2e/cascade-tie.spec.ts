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
 * ADR-DS-2, behavior 4 (`emotion_wins_cascade_ties_via_injectfirst`). Proves
 * the *resolved computed style*, not just `@layer` declaration order (that
 * weaker check already lives in `e2e/coexistence.spec.ts`). Mounts
 * `CascadeTieFixtureCard` — one element with both a colliding Tailwind
 * utility class (`bg-red-600`) and an Emotion/MUI `sx` background
 * (`brand.orange`) — through the real provider stack
 * (`AppRouterCacheProvider options={{ enableCssLayer: true }}` +
 * `ThemeProvider`) via its Storybook story, and asserts the computed
 * `background-color` is MUI's `brand.orange`, not Tailwind's `bg-red-600`.
 * Builds a static Storybook output independently of the shared `webServer`,
 * mirroring `e2e/storybook-adapter.spec.ts`'s harness.
 */
let outDir: string;
let server: Server;
let baseUrl: string;

test.beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), "storybook-e2e-cascade-"));
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

test("MUI sx background wins the cascade tie against a colliding Tailwind utility class", async ({
  page,
}) => {
  await page.goto(`${baseUrl}/iframe.html?id=atoms-cascadetiefixturecard--default&viewMode=story`);

  const fixture = page.getByTestId("cascade-tie-fixture");
  await expect(fixture).toBeVisible();

  const backgroundColor = await fixture.evaluate((el) => getComputedStyle(el).backgroundColor);

  // brand.orange = #f97316 -> rgb(249, 115, 22). Tailwind's bg-red-600 is
  // rgb(220, 38, 38) — a distinctly different value, so this assertion can
  // only pass if MUI actually won the tie, not by color-value coincidence.
  expect(backgroundColor).toBe("rgb(249, 115, 22)");
});
