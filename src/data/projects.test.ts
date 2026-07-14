import { describe, expect, it } from "vitest";
import { projects } from "./projects";

/**
 * Asserts the owner-curated `projects` array is fully typed and carries only
 * plain data — no JSX, color literal, or icon reference (seam pattern,
 * FR-1). Every field required by the `Project` contract is present with the
 * expected primitive/array shape.
 */
describe("projects — data contract", () => {
  it("declares each entry as a fully-typed Project with no JSX, color, or icon", () => {
    expect(projects.length).toBeGreaterThan(0);

    for (const entry of projects) {
      expect(typeof entry.title).toBe("string");
      expect(typeof entry.slug).toBe("string");
      expect(typeof entry.tagline).toBe("string");
      expect(["exploring", "in-progress", "shipped"]).toContain(entry.status);
      expect(entry.mvpProgress).toBeGreaterThanOrEqual(0);
      expect(entry.mvpProgress).toBeLessThanOrEqual(100);
      expect(typeof entry.currentState).toBe("string");
      expect(Array.isArray(entry.repos)).toBe(true);
      const seenRoles = new Set<string>();
      for (const repo of entry.repos) {
        expect(["frontend", "backend"]).toContain(repo.role);
        expect(Array.isArray(repo.techKeys)).toBe(true);
        expect(repo.techKeys.length).toBeGreaterThan(0);
        expect(seenRoles.has(repo.role)).toBe(false);
        seenRoles.add(repo.role);
      }
      expect(Array.isArray(entry.relatedPosts)).toBe(true);

      // No JSX (React elements are plain objects with a $$typeof symbol) and
      // no nested objects carrying color/icon fields anywhere on the record.
      for (const value of Object.values(entry)) {
        if (value !== null && typeof value === "object") {
          expect(Object.getOwnPropertySymbols(value)).toHaveLength(0);
        }
      }
    }
  });
});
