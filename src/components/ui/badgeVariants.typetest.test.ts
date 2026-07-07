import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

/**
 * FR-6 continued: an invalid/unlisted Badge `category` must be a TypeScript
 * compile error, never a silent runtime fallback. `badgeVariants.typetest.ts`
 * is the fixture; this test is the mechanical check that `tsc --noEmit`
 * (which type-checks the fixture alongside the rest of the project) reports
 * exactly the expected `@ts-expect-error` and nothing else.
 */
describe("badgeVariants.typetest.ts proves category is a closed union (FR-6)", () => {
  it("npx tsc --noEmit passes clean, confirming the @ts-expect-error is real", () => {
    const result = spawnSync("npx", ["tsc", "--noEmit"], {
      cwd: process.cwd(),
      encoding: "utf-8",
    });

    expect(result.status, result.stdout + result.stderr).toBe(0);
  });
});
