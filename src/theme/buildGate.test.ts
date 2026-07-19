import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

/**
 * FR-1 (`build_succeeds_and_existing_routes_render_unchanged`), build-gate
 * half. The visual-unchanged half of this behavior is already covered by
 * `e2e/blog.spec.ts`'s "existing routes render without regression" (route-
 * regression sweep) suite, which runs against a real dev server - this test
 * only needs to
 * prove the *production* build (`next build`, the actual SSG path routes
 * ship through) still exits 0 with the coexistence tooling in place. Skipped
 * outside CI by default (a full `next build` is too slow to run on every
 * vitest invocation during local iteration); CI runs it via `CI=true`.
 */
describe.skipIf(!process.env.CI)("production build (FR-1 build-gate)", () => {
  it(
    "npm run build exits 0",
    () => {
      const result = spawnSync("npm", ["run", "build"], {
        encoding: "utf-8",
        timeout: 5 * 60 * 1000,
      });

      expect(result.status).toBe(0);
    },
    5 * 60 * 1000
  );
});
