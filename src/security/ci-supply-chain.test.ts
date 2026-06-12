import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression tests for the supply-chain security acceptance criterion:
 * - CI runs `npm ci` (installs strictly from the committed lockfile)
 * - CI runs `npm audit --audit-level=high` (fails on high+ vulnerabilities)
 * - package-lock.json is committed at the repo root
 */

const REPO_ROOT = join(import.meta.dirname, "../..");
const CI_WORKFLOW = join(REPO_ROOT, ".github/workflows/ci.yml");

describe("CI supply-chain security gate", () => {
  it("package-lock.json exists at the repo root", () => {
    expect(existsSync(join(REPO_ROOT, "package-lock.json"))).toBe(true);
  });

  it("CI workflow file exists", () => {
    expect(existsSync(CI_WORKFLOW)).toBe(true);
  });

  it("CI workflow contains an `npm ci` install step", () => {
    const content = readFileSync(CI_WORKFLOW, "utf8");
    expect(content).toMatch(/run:\s*npm\s+ci\b/);
  });

  it("CI workflow contains an `npm audit --audit-level=high` step", () => {
    const content = readFileSync(CI_WORKFLOW, "utf8");
    expect(content).toMatch(/run:\s*npm\s+audit\s+--audit-level=high/);
  });
});
