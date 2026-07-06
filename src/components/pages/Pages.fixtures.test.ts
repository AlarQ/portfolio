import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Structural guard (test_case: reuses_shared_post_fixture_from_005_not_recreated):
 * proves the Pages pack sources its Post fixtures from the single shared
 * fixture (`src/stories/fixtures/posts.ts`, owned by Task 005) rather than
 * declaring a second, parallel Post-shaped literal. A source-level scan
 * catches this even if a future edit renders correctly but silently forks
 * the fixture.
 */

const PAGES_DIR = import.meta.dirname;
const COMPONENT_FILES = ["Home.tsx", "BlogListing.tsx", "SinglePost.tsx", "Author.tsx"];
const STORY_FILES = [
  "Home.stories.tsx",
  "BlogListing.stories.tsx",
  "SinglePost.stories.tsx",
  "Author.stories.tsx",
];

describe("Pages fixtures — reuse shared Post fixture, never recreate it", () => {
  it("every Pages story imports samplePost/samplePosts from the shared fixture module", () => {
    for (const file of STORY_FILES) {
      const source = readFileSync(join(PAGES_DIR, file), "utf8");
      expect(source).toContain("@/stories/fixtures/posts");
    }
  });

  it("no Pages component or story declares a second Post-shaped fixture literal", () => {
    for (const file of [...COMPONENT_FILES, ...STORY_FILES]) {
      const source = readFileSync(join(PAGES_DIR, file), "utf8");
      // A recreated fixture would assign a literal object with these Post
      // fields together; the real fixture only ever appears via import.
      expect(source).not.toMatch(/slug:\s*["'][\w-]+["']/);
    }
  });
});

/**
 * Guardrail (test_case: fixture_omitting_or_renaming_post_field_is_compile_error,
 * FR-8 / type-safety.md): proves the Pages pack carries an inline negative
 * case — a Post-shaped object missing a required field — suppressed with
 * `@ts-expect-error`, so a future schema drift on `Post` is caught by tsc,
 * not silently accepted. This lives in a dedicated compile-time-only file
 * (Pages.type-test.ts), not a story, since it's a type check rather than a
 * Storybook story. This is a source-level proof the guard exists;
 * `npm run type-check` is the mechanism that actually enforces it.
 */
describe("Pages — inline compile-time Post-shape guardrail (FR-8)", () => {
  it("Pages.type-test.ts suppresses a deliberately invalid Post literal with @ts-expect-error", () => {
    const source = readFileSync(join(PAGES_DIR, "Pages.type-test.ts"), "utf8");
    const hasGuard = source.includes("@ts-expect-error") && /:\s*Post\s*=/.test(source);
    expect(hasGuard).toBe(true);
  });
});
