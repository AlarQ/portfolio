import { describe, expect, it } from "vitest";
import { mvpProgressTone } from "./projectPresentation";

describe("mvpProgressTone", () => {
  it.each([
    [0, "secondary"],
    [49, "secondary"],
    [50, "primary"],
    [79, "primary"],
    [80, "success"],
    [100, "success"],
  ])("progress %i → %s", (progress, expected) => {
    expect(mvpProgressTone(progress)).toBe(expected);
  });
});
