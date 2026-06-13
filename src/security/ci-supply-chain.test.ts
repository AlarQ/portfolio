import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression tests for the supply-chain security acceptance criterion. The
 * gate lives in the pre-push hook (GitHub Actions runs no checks):
 * - `npm audit --audit-level=high` fails the push on high+ vulnerabilities
 * - package-lock.json is committed at the repo root
 */

const REPO_ROOT = join(import.meta.dirname, "../..");
const PRE_PUSH_HOOK = join(REPO_ROOT, ".husky/pre-push");

describe("supply-chain security gate", () => {
  it("package-lock.json exists at the repo root", () => {
    expect(existsSync(join(REPO_ROOT, "package-lock.json"))).toBe(true);
  });

  it("pre-push hook contains an `npm audit --audit-level=high` step", () => {
    const content = readFileSync(PRE_PUSH_HOOK, "utf8");
    expect(content).toMatch(/npm\s+audit\s+--audit-level=high/);
  });
});
