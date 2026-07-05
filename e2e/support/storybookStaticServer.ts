import { spawnSync } from "node:child_process";
import { createReadStream, existsSync, mkdtempSync, rmSync } from "node:fs";
import type { Server } from "node:http";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

export interface StorybookStaticServer {
  baseUrl: string;
  close: () => Promise<void>;
}

/**
 * Builds a static Storybook output into a temp dir and serves it from an
 * ephemeral local server, independent of the shared Playwright `webServer`
 * (which serves the live Next app). Shared by e2e specs that need to render
 * a real Storybook story in a browser — currently
 * `storybook-adapter.spec.ts` (ADR-DS-1) and `cascade-tie.spec.ts`
 * (ADR-DS-2) — extracted here once a second call site proved this wasn't
 * one-off.
 */
export async function startStorybookStaticServer(
  tmpPrefix: string
): Promise<StorybookStaticServer> {
  const outDir = mkdtempSync(join(tmpdir(), tmpPrefix));
  const result = spawnSync("npx", ["storybook", "build", "-o", outDir], { encoding: "utf-8" });
  if (result.status !== 0) {
    throw new Error(`storybook build failed:\n${result.stdout}\n${result.stderr}`);
  }

  const server: Server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    let filePath = join(outDir, url.pathname === "/" ? "index.html" : url.pathname);
    if (!existsSync(filePath)) filePath = join(outDir, "index.html");
    res.setHeader("Content-Type", MIME[extname(filePath)] ?? "application/octet-stream");
    createReadStream(filePath).pipe(res);
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;

  return {
    baseUrl: `http://localhost:${port}`,
    close: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      rmSync(outDir, { recursive: true, force: true });
    },
  };
}
