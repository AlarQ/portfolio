import { describe, expect, it } from "vitest";
import { STATUS_TONES, statusDotVariants } from "./statusDotVariants";

/**
 * FR-6, FR-10: status-dot binds ONLY semantic Tailwind utility classes — no
 * hex, no `primitives` import, no Tailwind arbitrary-value colors
 * (`bg-[#...]`). Mirrors `badgeVariants.test.ts`'s exhaustiveness check.
 */
describe("status-dot tone CVA map binds only semantic tokens (FR-6, FR-10)", () => {
  it("defines exactly the 3 StatusTone values", () => {
    expect(STATUS_TONES).toEqual(["muted", "info", "success"]);
  });

  it.each(
    STATUS_TONES
  )("tone %s resolves to a semantic-token bg class, never inline hex", (tone) => {
    const className = statusDotVariants({ tone });

    expect(className).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(className).not.toMatch(/bg-\[/);
    expect(className).toMatch(/\bbg-[a-z-]+\b/);
  });
});
