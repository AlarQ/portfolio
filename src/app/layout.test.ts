import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * FR-7 acceptance #1: no route mounts `MuiThemeProvider`, `CssBaseline`, or
 * `AppRouterCacheProvider` - the MUI/Emotion half of the coexistence pattern
 * is fully unmounted from the root layout (the only place it was wired).
 * Source-level check mirrors the project's existing gate style
 * (`coexistence.test.ts`, `lintGate.test.ts`) rather than mounting the full
 * server component tree (fonts + async layout make that impractical here).
 */
describe("root layout carries no MUI/Emotion provider (FR-7)", () => {
  it("no_mui_provider_in_rendered_tree_on_any_route", () => {
    const source = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf-8");

    expect(source).not.toMatch(/AppRouterCacheProvider/);
    expect(source).not.toMatch(/MuiThemeProvider/);
    expect(source).not.toMatch(/CssBaseline/);
    expect(source).not.toMatch(/@mui\//);
  });
});
