import { describe, expect, it } from "vitest";
import { brand } from "@/theme/theme";
import { categoryColor } from "./skillPresentation";

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
