import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { brand, shikiVars } from "./theme";

/**
 * Enforcement test for the *one source of color truth, two surfaces* invariant
 * (ADR-0001). The `--shiki-*` CSS vars in `globals.css` are the second surface of
 * the `brand` seam; this test locks each var's value to its source `brand` token
 * so a `brand` change that fails to propagate to the CSS var fails CI rather than
 * silently splitting the syntax-highlighting palette.
 */

/** All declared brand hex/rgba values — the closed set a shiki var may resolve to. */
const brandValues = new Set(Object.values(brand));

/** Parse `--shiki-*: <value>;` declarations out of globals.css. */
function readShikiVarsFromCss(): Record<string, string> {
  const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf-8");
  const declarations: Record<string, string> = {};
  const pattern = /(--shiki-[a-z0-9-]+)\s*:\s*([^;]+);/g;
  for (const match of css.matchAll(pattern)) {
    declarations[match[1]] = match[2].trim();
  }
  return declarations;
}

describe("shikiVars seam (theme.ts)", () => {
  it("every shiki var value is a brand token — no raw hue", () => {
    for (const [name, value] of Object.entries(shikiVars)) {
      expect(brandValues, `${name} must resolve to a brand token`).toContain(value);
    }
  });

  it("defines the full token palette a code block needs", () => {
    const required = [
      "--shiki-bg",
      "--shiki-fg",
      "--shiki-token-comment",
      "--shiki-token-keyword",
      "--shiki-token-string",
      "--shiki-token-constant",
      "--shiki-token-function",
      "--shiki-token-variable",
    ];
    for (const name of required) {
      expect(Object.keys(shikiVars), `shikiVars must define ${name}`).toContain(name);
    }
  });
});

describe("shiki-vars-match-brand (globals.css ↔ theme.ts)", () => {
  const cssVars = readShikiVarsFromCss();

  it("each --shiki-* declared in globals.css matches its source brand token", () => {
    for (const [name, brandValue] of Object.entries(shikiVars)) {
      expect(cssVars, `globals.css must declare ${name}`).toHaveProperty(name);
      expect(cssVars[name], `${name} drifted from its brand source`).toBe(brandValue);
    }
  });

  it("globals.css declares no --shiki-* var that is absent from the theme seam", () => {
    for (const name of Object.keys(cssVars)) {
      expect(
        Object.keys(shikiVars),
        `${name} in globals.css has no source in theme.ts shikiVars`
      ).toContain(name);
    }
  });
});
