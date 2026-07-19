import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * FR-4 Acceptance #5 (Task 004): shadcn-generated source is reviewed as
 * first-party code, and new Radix/CVA deps introduced by this task are
 * pinned exact with the lockfile committed - not left on a caret/tilde
 * range that could silently drift.
 */
const PINNED_DEPS = [
  "radix-ui",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "lucide-react",
];

function readPackageJson(): Record<string, unknown> {
  const raw = readFileSync(join(process.cwd(), "package.json"), "utf-8");
  return JSON.parse(raw) as Record<string, unknown>;
}

describe("Task 004 deps are pinned exact (sec-deps-pinned-and-locked)", () => {
  const pkg = readPackageJson();
  const dependencies = pkg.dependencies as Record<string, string>;

  it.each(PINNED_DEPS)("%s is declared in dependencies", (name) => {
    expect(dependencies[name]).toBeDefined();
  });

  it.each(PINNED_DEPS)("%s has no caret or tilde range in package.json", (name) => {
    const version = dependencies[name];
    expect(version).toBeDefined();
    expect(version.startsWith("^")).toBe(false);
    expect(version.startsWith("~")).toBe(false);
  });
});
