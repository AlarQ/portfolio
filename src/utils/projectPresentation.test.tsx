import { describe, expect, it } from "vitest";
import { projectPresentation } from "./projectPresentation";

/**
 * FR-3 / exploring-muted-tone (spec.md): a Project with `status: "exploring"`
 * must resolve to a `muted` tone via the seam — de-emphasis is a seam rule,
 * not a component branch.
 */
describe("projectPresentation — Status → {tone,label,dot}", () => {
  it("resolves 'exploring' status to a muted tone", () => {
    expect(projectPresentation("exploring").tone).toBe("muted");
  });

  it("resolves a non-exploring status with low mvpProgress to a muted tone", () => {
    expect(projectPresentation("in-progress", 5).tone).toBe("muted");
  });

  it("resolves a non-exploring status with high mvpProgress to its own tone", () => {
    expect(projectPresentation("in-progress", 80).tone).toBe("info");
  });

  it("resolves a non-exploring status at exactly the threshold to its own tone (not muted)", () => {
    expect(projectPresentation("in-progress", 10).tone).toBe("info");
  });
});
