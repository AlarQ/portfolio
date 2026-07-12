import { afterEach, describe, expect, it, vi } from "vitest";
import { buildProjectSet } from "./projectLoader";
import type { Project } from "./projects";

/**
 * Unit tests for the pure core `buildProjectSet(candidates): Project[]`.
 *
 * `projects.ts`'s owner-curated array is authored directly in code (no MDX
 * frontmatter, no filesystem read) so the "raw input" here is simply a
 * candidate `Project[]` — the pure core's job is to validate every slug
 * against the blog-identical `^[a-z0-9-]+$` gate before the set is trusted
 * downstream (FR-2, mirrors `buildPostSet`).
 */

function project(overrides: Partial<Project>): Project {
  return {
    title: "Sample Project",
    slug: "sample-project",
    tagline: "A sample project.",
    status: "in-progress",
    mvpProgress: 50,
    currentState: "Building the core loop.",
    techStack: ["typescript"],
    relatedPosts: [],
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildProjectSet — valid slug", () => {
  it("keeps a Project whose slug matches ^[a-z0-9-]+$", () => {
    // Given a single candidate with a valid slug
    const candidates: Project[] = [project({ slug: "portfolio-site" })];

    // When the pure core validates the set
    const result = buildProjectSet(candidates);

    // Then the Project is kept, unaltered
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("portfolio-site");
  });
});

describe("buildProjectSet — invalid slug", () => {
  it("skips a Project whose slug violates the pattern and warns naming it", () => {
    // Given a candidate slug containing characters outside [a-z0-9-]
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates: Project[] = [project({ slug: "Bad Slug!" }), project({ slug: "good-slug" })];

    // When the pure core validates the set
    const result = buildProjectSet(candidates);

    // Then only the valid entry survives, and a build warning names the bad slug
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("good-slug");
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Bad Slug!"));
  });
});

describe("buildProjectSet — iteration order", () => {
  it("preserves input (declaration) order, never sorting or reordering", () => {
    // Given candidates in a deliberately non-alphabetical declaration order
    const candidates: Project[] = [
      project({ slug: "zebra-project", title: "Zebra" }),
      project({ slug: "alpha-project", title: "Alpha" }),
      project({ slug: "middle-project", title: "Middle" }),
    ];

    // When the pure core validates the set
    const result = buildProjectSet(candidates);

    // Then order equals declaration order — the first entry stays the
    // default-selected Project, not a sorted-first one
    expect(result.map((p) => p.slug)).toEqual(["zebra-project", "alpha-project", "middle-project"]);
  });
});

describe("buildProjectSet — path traversal slug", () => {
  it("skips a traversal slug via the regex gate alone, never touching the filesystem", () => {
    // Given a candidate slug carrying a traversal segment
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const candidates: Project[] = [project({ slug: "../../etc/passwd" })];

    // When the pure core validates the set
    const result = buildProjectSet(candidates);

    // Then it is rejected by the same regex gate as any other invalid slug —
    // the pure core has no fs import, so it cannot have joined this to a path
    expect(result).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("../../etc/passwd"));
  });
});
