import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression tests for acceptance criterion #3 of task 006-security-hardening:
 * "gitleaks configured pre-commit AND in CI; a commit/build containing a
 * detectable secret is blocked by the secret scan."
 *
 * These tests read the actual config files from disk and assert that gitleaks
 * is wired up in both the pre-commit hook and the CI workflow.
 */

const ROOT = resolve(__dirname, "../..");

describe("secret-scan — pre-commit hook", () => {
  it("invokes gitleaks over the staged diff", () => {
    // Given the pre-commit hook file on disk
    const hook = readFileSync(resolve(ROOT, ".husky/pre-commit"), "utf-8");

    // Then it contains a gitleaks invocation that scans staged changes
    expect(hook).toMatch(/gitleaks/);
    expect(hook).toMatch(/--staged/);
  });
});

describe("secret-scan — CI workflow", () => {
  it("includes a gitleaks secret-scan step", () => {
    // Given the CI workflow file on disk
    const ci = readFileSync(resolve(ROOT, ".github/workflows/ci.yml"), "utf-8");

    // Then it contains a step that uses or runs gitleaks
    expect(ci).toMatch(/gitleaks/i);
  });

  it("uses the gitleaks-action in the security job", () => {
    // Given the CI workflow file on disk
    const ci = readFileSync(resolve(ROOT, ".github/workflows/ci.yml"), "utf-8");

    // Then the gitleaks action is referenced (tolerant to minor version changes)
    expect(ci).toMatch(/gitleaks\/gitleaks-action/);
  });

  it("checks out with full history so gitleaks can scan the commit range", () => {
    // Given the CI workflow file on disk
    const ci = readFileSync(resolve(ROOT, ".github/workflows/ci.yml"), "utf-8");

    // Then fetch-depth: 0 is set (full history required by gitleaks on push)
    expect(ci).toMatch(/fetch-depth\s*:\s*0/);
  });
});
