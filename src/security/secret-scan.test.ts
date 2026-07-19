import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression tests for acceptance criterion #3 of task 006-security-hardening:
 * "gitleaks blocks a commit/push containing a detectable secret." The scan is
 * wired into both the pre-commit hook (staged diff) and the pre-push hook
 * (full gate) - GitHub Actions runs no checks.
 */

const ROOT = resolve(__dirname, "../..");

describe("secret-scan - pre-commit hook", () => {
  it("invokes gitleaks over the staged diff", () => {
    // Given the pre-commit hook file on disk
    const hook = readFileSync(resolve(ROOT, ".husky/pre-commit"), "utf-8");

    // Then it contains a gitleaks invocation that scans staged changes
    expect(hook).toMatch(/gitleaks/);
    expect(hook).toMatch(/--staged/);
  });
});

describe("secret-scan - pre-push hook", () => {
  it("invokes gitleaks as part of the push gate", () => {
    // Given the pre-push hook file on disk
    const hook = readFileSync(resolve(ROOT, ".husky/pre-push"), "utf-8");

    // Then it contains a gitleaks invocation
    expect(hook).toMatch(/gitleaks\s+git/);
  });

  it("fails closed when gitleaks is not installed", () => {
    // Given the pre-push hook file on disk
    const hook = readFileSync(resolve(ROOT, ".husky/pre-push"), "utf-8");

    // Then a missing gitleaks binary aborts the push (exit 1), never skips it
    expect(hook).toMatch(/exit 1/);
  });
});
