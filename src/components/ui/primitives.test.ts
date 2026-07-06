import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * FR-4 (shadcn primitives restyled to the Figma semantic layer, Task 004).
 * Exercises the actual files on disk under `src/components/ui/` — not a
 * simulation — since these ARE the shadcn-generated primitives this task
 * installs and restyles.
 */
const uiDir = join(process.cwd(), "src/components/ui");
const PRIMITIVES = ["badge", "button", "input", "card", "avatar", "navigation-menu", "sheet"];

// Tailwind's stock color-scale utilities (e.g. `bg-gray-100`, `text-blue-500`)
// resolve to Tailwind's own default palette, not our semantic bridge — a
// primitive lands here only if it never references one.
const STOCK_SCALE =
  /-(slate|zinc|neutral|stone|amber|lime|emerald|teal|cyan|blue|indigo|violet|purple|fuchsia|pink|rose|red|orange|yellow|green|sky|gray)-[0-9]{2,3}\b/;
const RAW_HEX = /#[0-9a-fA-F]{3,8}\b/;
const STOCK_LITERAL = /\b(?:bg|text|border|ring)-(?:white|black)\b/;

function readPrimitiveSource(name: string): string {
  return readFileSync(join(uiDir, `${name}.tsx`), "utf-8");
}

describe("shadcn primitives land in the components tree (FR-4)", () => {
  it.each(PRIMITIVES)("%s.tsx exists under src/components/ui", (name) => {
    expect(() => readPrimitiveSource(name)).not.toThrow();
  });

  it.each(PRIMITIVES)("%s.tsx imports the semantic cn() helper, not raw styling", (name) => {
    expect(readPrimitiveSource(name)).toContain('from "@/lib/utils"');
  });
});

describe("primitives restyled to the Figma semantic layer, no stock defaults (FR-4)", () => {
  it.each(PRIMITIVES)("%s.tsx contains no raw hex literal", (name) => {
    expect(readPrimitiveSource(name)).not.toMatch(RAW_HEX);
  });

  it.each(PRIMITIVES)("%s.tsx contains no Tailwind stock color-scale utility", (name) => {
    expect(readPrimitiveSource(name)).not.toMatch(STOCK_SCALE);
  });

  it.each(PRIMITIVES)("%s.tsx contains no hardcoded white/black utility", (name) => {
    expect(readPrimitiveSource(name)).not.toMatch(STOCK_LITERAL);
  });
});

describe("primitives pass the token-purity lint gate (Task 003 rule, mechanical)", () => {
  it("npm run lint passes clean against src/components/ui", () => {
    const result = spawnSync("npx", ["biome", "check", "src/components/ui"], {
      cwd: process.cwd(),
      encoding: "utf-8",
    });

    expect(result.status, result.stdout + result.stderr).toBe(0);
  });
});
