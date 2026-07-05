import { readFileSync } from "node:fs";
import { join } from "node:path";
import tailwindPostcss from "@tailwindcss/postcss";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

/**
 * ADR-DS-2 (`preflight-disabled-baseline-intact`). Compiles the real
 * `globals.css` through the actual `@tailwindcss/postcss` plugin used by
 * `postcss.config.mjs` and asserts on the emitted CSS directly — the
 * mechanical proxy for "MUI CssBaseline stays the base-element authority":
 * Tailwind's `theme`/`utilities` layers compile, but the `preflight` layer's
 * signature reset rule (`-webkit-text-size-adjust`, unique to Tailwind's
 * preflight, never emitted by `theme`/`utilities` alone) never appears,
 * because `globals.css` imports only `tailwindcss/theme` and
 * `tailwindcss/utilities` (never `tailwindcss/preflight` or the `tailwindcss`
 * umbrella import that bundles it).
 */
describe("Tailwind preflight is disabled at the CSS-import level (ADR-DS-2)", () => {
  it("compiles globals.css without emitting Tailwind's preflight reset", async () => {
    const globalsCssPath = join(process.cwd(), "src/app/globals.css");
    const source = readFileSync(globalsCssPath, "utf-8");

    const result = await postcss([tailwindPostcss()]).process(source, { from: globalsCssPath });

    expect(result.css).toMatch(/@layer theme/);
    expect(result.css).not.toMatch(/-webkit-text-size-adjust/);
  });
});
