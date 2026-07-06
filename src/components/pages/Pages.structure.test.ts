import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Structural guard (test_case: pages_import_organisms_only_no_reimplementation):
 * proves each Pages screen composes Task 006 organisms rather than
 * reimplementing their markup/copy inline. Checks both that each file
 * imports from `@/components/ds/` and that it doesn't contain telltale
 * copies of organism-owned literal strings (a sign of hand-rolled
 * reimplementation instead of composition).
 */

const PAGES_DIR = import.meta.dirname;

const ORGANISM_REIMPLEMENTATION_MARKERS = [
  "Advertisement", // AdsSpace's own copy
  "border-dashed", // AdsSpace's own styling
  "min read", // PageInfo/PostCard's own copy
];

describe("Pages components — compose organisms, never reimplement them", () => {
  it.each([
    ["Home.tsx"],
    ["BlogListing.tsx"],
    ["SinglePost.tsx"],
    ["Author.tsx"],
  ])("%s imports at least one organism from @/components/ds/", (file) => {
    const source = readFileSync(join(PAGES_DIR, file), "utf8");
    expect(source).toMatch(/@\/components\/ds\//);
  });

  it.each([
    ["Home.tsx"],
    ["BlogListing.tsx"],
    ["SinglePost.tsx"],
    ["Author.tsx"],
  ])("%s contains no inline reimplementation of organism-owned markup/copy", (file) => {
    const source = readFileSync(join(PAGES_DIR, file), "utf8");
    for (const marker of ORGANISM_REIMPLEMENTATION_MARKERS) {
      expect(source).not.toContain(marker);
    }
  });
});
