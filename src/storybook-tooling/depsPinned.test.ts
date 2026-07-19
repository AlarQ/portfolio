import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * sec-deps-pinned-and-locked (spec.md), scoped to THIS pack's own dep influx
 * only - Tailwind v4, @tailwindcss/postcss, postcss, Storybook 9/10
 * (storybook, @storybook/nextjs), next-themes. Biome pinning is 003's
 * ownership (ADR-DS-6) and Radix/CVA/shadcn is 004's - asserting those here
 * would duplicate a check another task already owns.
 */
describe("design-system pack's own new deps are pinned exact (sec-deps-pinned-and-locked)", () => {
  const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf-8")) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  const scopedDeps: Array<[string, "dependencies" | "devDependencies"]> = [
    ["next-themes", "dependencies"],
    ["tailwindcss", "devDependencies"],
    ["@tailwindcss/postcss", "devDependencies"],
    ["postcss", "devDependencies"],
    ["storybook", "devDependencies"],
    ["@storybook/nextjs", "devDependencies"],
  ];

  it.each(scopedDeps)("%s in %s is pinned exact (no ^ or ~)", (name, section) => {
    const version = packageJson[section][name];
    expect(version, `${name} missing from ${section}`).toBeDefined();
    expect(version).not.toMatch(/^[\^~]/);
  });

  it("pnpm-lock.yaml is committed to the repo (tracked by git, not just present on disk)", () => {
    const result = spawnSync("git", ["ls-files", "--error-unmatch", "pnpm-lock.yaml"], {
      encoding: "utf-8",
    });
    expect(result.status).toBe(0);
  });
});
