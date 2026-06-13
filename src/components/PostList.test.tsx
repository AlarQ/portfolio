import { describe, expect, it } from "vitest";
import type { Post } from "@/data/posts";
import { splitFeatured } from "./PostList";

/**
 * Unit coverage for the featured-first split. The loader already orders Posts
 * newest-first (see `postLoader.test.ts`), so `splitFeatured` only has to carve
 * the ordered set into a featured head + the remaining tail without reordering.
 * Exercising it at N=3/1/0 here is what verifies the FR-8 "degrades 1→N"
 * invariant — the fs-bound loader yields a single content Post, so N>1 cannot be
 * reached from e2e.
 */

const post = (slug: string, date: string): Post => ({
  slug,
  title: `Title ${slug}`,
  dek: `Dek ${slug}`,
  date,
  readingTimeMinutes: 3,
  formattedDate: date,
  published: true,
});

describe("splitFeatured", () => {
  it("makes the first Post featured and keeps the rest in input order (N=3)", () => {
    const newest = post("c", "2026-03-01");
    const mid = post("b", "2026-02-01");
    const oldest = post("a", "2026-01-01");

    const { featured, rest } = splitFeatured([newest, mid, oldest]);

    expect(featured).toBe(newest);
    expect(rest).toEqual([mid, oldest]);
  });

  it("features the lone Post with no remaining tail (N=1)", () => {
    const only = post("a", "2026-01-01");

    const { featured, rest } = splitFeatured([only]);

    expect(featured).toBe(only);
    expect(rest).toEqual([]);
  });

  it("yields no featured Post for an empty set (N=0)", () => {
    const { featured, rest } = splitFeatured([]);

    expect(featured).toBeNull();
    expect(rest).toEqual([]);
  });
});
