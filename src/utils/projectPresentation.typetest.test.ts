import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

/**
 * FR-3 continued: an invalid/unlisted `TechKey` passed to the seam must be a
 * TypeScript compile error, never a silent runtime fallback.
 * `projectPresentation.typetest.ts` is the fixture; this test is the
 * mechanical check that `tsc --noEmit` (which type-checks the fixture
 * alongside the rest of the project) reports exactly the expected
 * `@ts-expect-error`s and nothing else.
 */
describe("projectPresentation.typetest.ts proves TechKey map is a closed union (FR-3)", () => {
  it("npx tsc --noEmit passes clean, confirming the @ts-expect-errors are real", () => {
    const result = spawnSync("npx", ["tsc", "--noEmit"], {
      cwd: process.cwd(),
      encoding: "utf-8",
    });

    expect(result.status, result.stdout + result.stderr).toBe(0);
  }, 60_000);
});
