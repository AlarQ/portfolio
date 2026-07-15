import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    // Off unless `--coverage` is passed (test:coverage), so plain test:unit
    // stays fast. lcov.info feeds scripts/check-diff-coverage.mjs.
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "lcov"],
      reportsDirectory: "./coverage",
      // `include` is reported in full in Vitest 4 (the old `all` default),
      // so untested src files still emit per-line 0-hit data and count
      // against the diff-coverage floor.
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/*.stories.tsx", "src/**/*.d.ts"],
    },
  },
});
