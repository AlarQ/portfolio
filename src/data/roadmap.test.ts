import { describe, expect, it } from "vitest";
import type { Feature, Roadmap } from "./projects";
import { deriveMilestoneProgress } from "./roadmap";

function feature(overrides: Partial<Feature>): Feature {
  return { name: "Sample feature", status: "planned", phase: "toward", ...overrides };
}

function roadmap(features: readonly Feature[], milestoneName = "MVP"): Roadmap {
  return { milestoneName, features };
}

describe("deriveMilestoneProgress - progress-derived", () => {
  it("returns progress 0.5, shippedToward 3, totalToward 6 for 3 shipped of 6 toward Features", () => {
    // Given a Roadmap with 3 shipped and 3 unshipped `toward` Features
    const road = roadmap([
      feature({ name: "a", status: "shipped" }),
      feature({ name: "b", status: "shipped" }),
      feature({ name: "c", status: "shipped" }),
      feature({ name: "d", status: "in-progress" }),
      feature({ name: "e", status: "planned" }),
      feature({ name: "f", status: "planned" }),
    ]);

    // When Milestone Progress is derived
    const progress = deriveMilestoneProgress(road);

    // Then progress is 0.5 and the shipped/total counts match
    expect(progress.progress).toBe(0.5);
    expect(progress.percent).toBe(50);
    expect(progress.shippedToward).toBe(3);
    expect(progress.totalToward).toBe(6);
    expect(progress.milestoneName).toBe("MVP");
  });
});

describe("deriveMilestoneProgress - progress-ignores-beyond", () => {
  it("leaves progress unchanged when a shipped beyond Feature is added", () => {
    // Given a Roadmap with 1 shipped of 2 toward Features
    const base = roadmap([
      feature({ name: "a", status: "shipped" }),
      feature({ name: "b", status: "planned" }),
    ]);
    const before = deriveMilestoneProgress(base);

    // When a shipped `beyond` Feature is added
    const withBeyond = roadmap([
      ...base.features,
      feature({ name: "c", status: "shipped", phase: "beyond" }),
    ]);
    const after = deriveMilestoneProgress(withBeyond);

    // Then progress, shippedToward, and totalToward are all unchanged
    expect(after.progress).toBe(before.progress);
    expect(after.shippedToward).toBe(before.shippedToward);
    expect(after.totalToward).toBe(before.totalToward);
    expect(after.beyond).toHaveLength(1);
  });
});

describe("deriveMilestoneProgress - 0-toward", () => {
  it("returns progress 0 (not NaN) when there are no toward Features", () => {
    // Given a Roadmap with only `beyond` Features
    const road = roadmap([feature({ name: "a", status: "planned", phase: "beyond" })]);

    // When Milestone Progress is derived
    const progress = deriveMilestoneProgress(road);

    // Then progress is 0, not a division-by-zero NaN
    expect(progress.progress).toBe(0);
    expect(progress.percent).toBe(0);
    expect(progress.totalToward).toBe(0);
    expect(progress.shippedToward).toBe(0);
  });
});

describe("deriveMilestoneProgress - order preserved", () => {
  it("preserves authored order within each of toward and beyond", () => {
    // Given Features authored in a deliberately interleaved, non-sorted order
    const road = roadmap([
      feature({ name: "toward-1", phase: "toward" }),
      feature({ name: "beyond-1", phase: "beyond" }),
      feature({ name: "toward-2", phase: "toward" }),
      feature({ name: "beyond-2", phase: "beyond" }),
    ]);

    // When Milestone Progress is derived
    const progress = deriveMilestoneProgress(road);

    // Then each group preserves its authored relative order
    expect(progress.toward.map((f) => f.name)).toEqual(["toward-1", "toward-2"]);
    expect(progress.beyond.map((f) => f.name)).toEqual(["beyond-1", "beyond-2"]);
  });
});
