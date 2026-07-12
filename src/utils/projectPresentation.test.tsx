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
});
