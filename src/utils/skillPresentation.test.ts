import { describe, expect, it } from "vitest";
import type { Skill } from "@/data/skills";
import { brand, withAlpha } from "@/theme/theme";
import { categoryColor, skillPresentation } from "./skillPresentation";

describe("categoryColor", () => {
  it.each([
    ["Leadership", brand.limeDark],
    ["Languages", brand.orangeDark],
    ["Architecture", brand.sky],
    ["Infrastructure", brand.orange],
    ["Databases", brand.lime],
    ["Tools", brand.slate],
  ] as const)("%s → expected brand token", (category, expected) => {
    expect(categoryColor(category)).toBe(expected);
  });
});

describe("skillPresentation", () => {
  it("iconBoxBg is category color at 15% opacity via withAlpha", () => {
    const skill: Skill = { name: "TypeScript", category: "Languages", icon: "code" };
    const { color, iconBoxBg } = skillPresentation(skill);
    expect(iconBoxBg).toBe(withAlpha(color, 0.15));
  });
});
