import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression tests for the supply-chain security acceptance criterion. The
 * gate lives in the pre-push hook (GitHub Actions runs no checks):
 * - `pnpm audit --audit-level high` fails the push on high+ vulnerabilities
 * - pnpm-lock.yaml is committed at the repo root
 */

const REPO_ROOT = join(import.meta.dirname, "../..");
const PRE_PUSH_HOOK = join(REPO_ROOT, ".husky/pre-push");

describe("supply-chain security gate", () => {
  it("pnpm-lock.yaml exists at the repo root", () => {
    expect(existsSync(join(REPO_ROOT, "pnpm-lock.yaml"))).toBe(true);
  });

  it("pre-push hook contains a `pnpm audit --audit-level high` step", () => {
    const content = readFileSync(PRE_PUSH_HOOK, "utf8");
    expect(content).toMatch(/pnpm\s+audit\s+--audit-level\s+high/);
  });
});
