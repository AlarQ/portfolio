import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Extends the shikiVars no-raw-hex discipline (theme/shikiVars.test.ts) to the
 * MDX presentation seams (task 005). These modules render Post body prose and
 * MUST resolve every hue through a `brand` token re-export — never a raw hex or
 * `rgb()/rgba()` literal — so a color change stays a one-place edit in
 * `theme.ts` (the single brand-color seam, CLAUDE.md).
 */

const SEAM_FILES = ["mdxPresentationText.tsx", "mdxPresentationBlock.tsx"];

/** A raw hex color literal, e.g. `#0ea5e9` or `#fff`. */
const HEX_LITERAL = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;

/** A hand-typed rgb()/rgba() call — colors must flow through `withAlpha(brand.x, …)` instead. */
const RGB_LITERAL = /\brgba?\(\s*\d/g;

describe("mdx presentation seams — no raw color literals", () => {
  for (const file of SEAM_FILES) {
    it(`${file} introduces no raw hex or rgb() color literal`, () => {
      const source = readFileSync(join(process.cwd(), "src", "utils", file), "utf-8");

      expect(source.match(HEX_LITERAL), `${file} must not contain a raw hex literal`).toBeNull();
      expect(
        source.match(RGB_LITERAL),
        `${file} must not contain a hand-typed rgb()/rgba() literal — use withAlpha(brand.x, …)`
      ).toBeNull();
    });
  }
});
