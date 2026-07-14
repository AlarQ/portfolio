import { describe, expect, it } from "vitest";
import type { SkillLevel } from "@/data/domains";
import { skillPresentation } from "./skillPresentation";

describe("skillPresentation", () => {
  it("resolves each SkillLevel to a non-empty label and a Badge hue", () => {
    const levels: readonly SkillLevel[] = ["expert", "proficient"];
    for (const level of levels) {
      const { label, category } = skillPresentation(level);
      expect(label.length).toBeGreaterThan(0);
      expect(category.length).toBeGreaterThan(0);
    }
  });

  it("maps expert and proficient to distinct hues", () => {
    expect(skillPresentation("expert").category).not.toBe(skillPresentation("proficient").category);
  });
});
