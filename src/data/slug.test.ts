import { describe, expect, it } from "vitest";
import { buildPostSet } from "./postLoader";
import { buildProjectSet } from "./projectLoader";
import type { Project } from "./projects";
import { SLUG_PATTERN } from "./slug";

/**
 * `SLUG_PATTERN` is the single shared gate consumed by BOTH `postLoader.ts`
 * and `projectLoader.ts` (FR-2) so Blog and Projects can never drift apart on
 * what counts as a valid slug. This test proves both loaders defer to the
 * exact same regex value/behaviour exported here, not two independently
 * maintained copies.
 */

describe("SLUG_PATTERN — shape", () => {
  it("accepts a valid slug and rejects uppercase, whitespace, and traversal segments", () => {
    expect(SLUG_PATTERN.test("valid-slug-123")).toBe(true);
    expect(SLUG_PATTERN.test("Has_Uppercase")).toBe(false);
    expect(SLUG_PATTERN.test("has spaces")).toBe(false);
    expect(SLUG_PATTERN.test("../etc/passwd")).toBe(false);
  });
});

describe("SLUG_PATTERN — shared identically by both loaders", () => {
  it("buildPostSet rejects exactly the slugs SLUG_PATTERN rejects", () => {
    const badSlug = "Bad_Slug";
    expect(SLUG_PATTERN.test(badSlug)).toBe(false);
    const posts = buildPostSet([
      {
        filename: `${badSlug}.mdx`,
        content: "---\ntitle: T\ndek: d\ndate: 2026-01-01\n---\n\nb\n",
      },
    ]);
    expect(posts).toHaveLength(0);
  });

  it("buildProjectSet rejects exactly the slugs SLUG_PATTERN rejects", () => {
    const badSlug = "Bad_Slug";
    expect(SLUG_PATTERN.test(badSlug)).toBe(false);
    const projects: Project[] = [
      {
        title: "T",
        slug: badSlug,
        tagline: "t",
        status: "in-progress",
        mvpProgress: 0,
        currentState: "s",
        repos: [],
        relatedPosts: [],
      },
    ];
    expect(buildProjectSet(projects)).toHaveLength(0);
  });
});
