import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for task 009's acceptance criterion #3: the set of files
 * importing `brand` from `theme/theme.ts` must not regrow past the
 * known-allowed consumers recorded when task 009 deleted the orphaned
 * presentation seams (brand consumer count 6→4). This is a scaffolding test
 * for task 010, which will remove `theme.ts`/`brand` entirely — once that
 * happens, this test (and its target) should be deleted along with it.
 */

// Files legitimately allowed to import `brand` from `theme/theme.ts` right
// now. `theme.ts` itself (definer) is not a consumer and is excluded.
const ALLOWED_BRAND_CONSUMERS = [
  "src/components/storybook-fixtures/CascadeTieFixtureCard.tsx",
  "src/utils/navPresentation.ts",
] as const;

const BRAND_IMPORT_PATTERN = /import\s*\{[^}]*\bbrand\b[^}]*\}\s*from\s*["']@\/theme\/theme["']/;

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(fullPath);
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) return [fullPath];
    return [];
  });
}

function findBrandConsumers(repoRoot: string): string[] {
  const files = listSourceFiles(join(repoRoot, "src"));
  return files
    .map((absolutePath) => relative(repoRoot, absolutePath))
    .filter((relativePath) => relativePath !== "src/theme/theme.ts")
    .filter((relativePath) => {
      const contents = readFileSync(join(repoRoot, relativePath), "utf-8");
      return BRAND_IMPORT_PATTERN.test(contents);
    })
    .sort();
}

describe("brand consumer set does not regress (task 009 → task 010 scaffolding)", () => {
  it("every file importing `brand` from theme.ts is on the known-allowed list", () => {
    const repoRoot = process.cwd();
    const consumers = findBrandConsumers(repoRoot);
    const allowed = [...ALLOWED_BRAND_CONSUMERS].sort();

    for (const consumer of consumers) {
      expect(allowed, `${consumer} imports brand but is not on the known-allowed list`).toContain(
        consumer
      );
    }

    // Also catch silent removals so the allowed list stays truthful — if a
    // consumer is cleaned up (task 010 progress), shrink this list too.
    expect(consumers, "brand consumer set drifted from the known-allowed list").toEqual(allowed);
  });
});
