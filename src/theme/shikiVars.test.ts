import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { primitives } from "./tokens";

/**
 * Enforcement test for the shiki palette's re-homed source of truth (FR-8,
 * ADR-RM-3). `--shiki-*` is now emitted by `tokens.css` from ungrouped
 * `tokens.ts` primitives — no longer from `theme.ts` `brand`/`shikiVars`. This
 * guards D-9 (repoint, don't delete): `theme.ts` is still present during the
 * overlap window, but is no longer the shiki source.
 */

const SHIKI_PRIMITIVE_NAMES = [
  "shikiBg",
  "shikiFg",
  "shikiTokenComment",
  "shikiTokenKeyword",
  "shikiTokenString",
  "shikiTokenConstant",
  "shikiTokenFunction",
  "shikiTokenVariable",
] as const;

/** Parse `--shiki-*: <value>;` declarations out of the generated tokens.css. */
function readShikiVarsFromTokensCss(): Record<string, string> {
  const css = readFileSync(join(process.cwd(), "src", "theme", "tokens.css"), "utf-8");
  const declarations: Record<string, string> = {};
  const pattern = /(--shiki-[a-z0-9-]+)\s*:\s*([^;]+);/g;
  for (const match of css.matchAll(pattern)) {
    declarations[match[1]] = match[2].trim();
  }
  return declarations;
}

function kebab(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([a-zA-Z])([0-9])/g, "$1-$2")
    .toLowerCase();
}

describe("shikivars_test_passes_against_tokens_source_with_theme_ts_still_present", () => {
  it("theme.ts still exists (overlap window, not yet deleted)", () => {
    expect(existsSync(join(process.cwd(), "src", "theme", "theme.ts"))).toBe(true);
  });

  it("defines the full shiki primitive set in tokens.ts", () => {
    for (const name of SHIKI_PRIMITIVE_NAMES) {
      expect(Object.keys(primitives), `tokens.ts primitives must define ${name}`).toContain(name);
    }
  });

  it("each --shiki-* var emitted by tokens.css equals its tokens.ts primitive source — not brand", () => {
    const cssVars = readShikiVarsFromTokensCss();
    for (const name of SHIKI_PRIMITIVE_NAMES) {
      const cssVarName = `--${kebab(name)}`;
      expect(cssVars, `tokens.css must declare ${cssVarName}`).toHaveProperty(cssVarName);
      expect(cssVars[cssVarName], `${cssVarName} drifted from its tokens.ts primitive source`).toBe(
        primitives[name as keyof typeof primitives]
      );
    }
  });

  it("tokens.css declares no --shiki-* var absent from the tokens.ts primitive source", () => {
    const cssVars = readShikiVarsFromTokensCss();
    const expectedNames = new Set(SHIKI_PRIMITIVE_NAMES.map((name) => `--${kebab(name)}`));
    for (const name of Object.keys(cssVars)) {
      expect(
        expectedNames,
        `${name} in tokens.css has no source in tokens.ts primitives`
      ).toContain(name);
    }
  });
});
