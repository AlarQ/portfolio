import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * ADR-DS-1 spike verification. `npm run storybook`/`storybook build` is the
 * real adapter boot path — this test runs the actual static build (the
 * fastest deterministic proxy for "boots with no adapter errors") against the
 * installed Next 16 version and asserts on its combined stdout/stderr, so a
 * regression in the `@storybook/nextjs` adapter fails CI instead of only
 * being caught by a human running `npm run storybook` locally.
 */
describe("storybook boots on Next 16 via @storybook/nextjs (ADR-DS-1)", () => {
  let outDir: string;
  let combinedOutput: string;

  beforeAll(() => {
    outDir = mkdtempSync(join(tmpdir(), "storybook-build-"));
    const result = spawnSync("npx", ["storybook", "build", "-o", outDir], {
      encoding: "utf-8",
    });
    combinedOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    if (result.status !== 0) {
      throw new Error(`storybook build failed (exit ${result.status}):\n${combinedOutput}`);
    }
  }, 120_000);

  afterAll(() => {
    rmSync(outDir, { recursive: true, force: true });
  });

  it("completes the build with no framework adapter errors", () => {
    expect(combinedOutput).toMatch(/Storybook build completed successfully/);
    expect(combinedOutput).not.toMatch(/adapter error/i);
    expect(combinedOutput).not.toMatch(/Cannot find module '@storybook\/nextjs'/);
    expect(combinedOutput).not.toMatch(/does not support Next(\.js)? 16/i);
  });
});
