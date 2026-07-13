import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

/**
 * FR-6/FR-10 continued: an invalid/unlisted `status-dot` `tone` must be a
 * TypeScript compile error, never a silent runtime fallback.
 * `statusDotVariants.typetest.ts` is the fixture; this test is the
 * mechanical check that `tsc --noEmit` (which type-checks the fixture
 * alongside the rest of the project) reports exactly the expected
 * `@ts-expect-error` and nothing else.
 */
describe("statusDotVariants.typetest.ts proves tone is a closed union (FR-6, FR-10)", () => {
  it("npx tsc --noEmit passes clean, confirming the @ts-expect-error is real", () => {
    const result = spawnSync("npx", ["tsc", "--noEmit"], {
      cwd: process.cwd(),
      encoding: "utf-8",
    });

    expect(result.status, result.stdout + result.stderr).toBe(0);
  }, 60_000);
});
