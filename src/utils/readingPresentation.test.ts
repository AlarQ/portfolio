import { describe, expect, it } from "vitest";
import { brand } from "@/theme/theme";
import { readingCategoryColor } from "./readingPresentation";

describe("readingCategoryColor", () => {
  it.each([
    ["IT", brand.sky],
    ["Self-Development", brand.lime],
    ["Business", brand.orange],
    ["Fiction", brand.violet],
    ["Other", brand.slate],
  ] as const)("%s → expected brand token", (category, expected) => {
    expect(readingCategoryColor(category)).toBe(expected);
  });
});
