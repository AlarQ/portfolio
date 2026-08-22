// @vitest-environment node
/**
 * Freshness + gate contract for the D2 diagram pipeline (ADR-0005).
 *
 * The committed SVGs under `public/diagrams/` are a generated artifact, exactly
 * like `tokens.css`: the source of truth is `content/diagrams/*.d2` plus the
 * token-resolved prelude. D2's WASM render is byte-deterministic, so this test
 * can do what `tokens.test.ts` does - re-run the generator and byte-compare -
 * and catch a source edited without re-rendering before it ships.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkClassVocabulary,
  checkNoColourLiteral,
  MAX_ASPECT_RATIO,
  renderScene,
  THEMES,
} from "../../scripts/diagram-lib/render";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "content", "diagrams");
const OUT_DIR = join(ROOT, "public", "diagrams");
const FONT_DIR = join(ROOT, "scripts", "diagram-lib", "fonts");

const scenes = readdirSync(SRC_DIR)
  .filter((n) => n.endsWith(".d2"))
  .map((n) => n.slice(0, -".d2".length))
  .sort();

const fonts = {
  regular: new Uint8Array(readFileSync(join(FONT_DIR, "Inter-Regular.ttf"))),
  bold: new Uint8Array(readFileSync(join(FONT_DIR, "Inter-Bold.ttf"))),
};

describe("diagram sources and committed SVGs (ADR-0005)", () => {
  it("there_is_at_least_one_scene", () => {
    expect(scenes.length).toBeGreaterThan(0);
  });

  it("every_committed_svg_belongs_to_a_d2_source", () => {
    const expected = new Set(scenes.flatMap((s) => THEMES.map((t) => `${s}-${t}.svg`)));
    const committed = readdirSync(OUT_DIR).filter((n) => n.endsWith(".svg"));
    expect(committed.sort()).toEqual([...expected].sort());
  });

  it.each(
    scenes
  )("%s renders both themes byte-identically to the committed SVGs", async (scene) => {
    const source = readFileSync(join(SRC_DIR, `${scene}.d2`), "utf8");
    const result = await renderScene(scene, source, fonts, {
      exemptFromAspect: scene.startsWith("_"),
    });
    expect(result.failures).toEqual([]);
    for (const theme of THEMES) {
      const committed = readFileSync(join(OUT_DIR, `${scene}-${theme}.svg`), "utf8");
      // Not `.toBe(committed)`: a byte diff would dump two 20 KB SVGs into the
      // failure output. The fix is always the same, so say it instead.
      expect(
        result.svgs[theme] === committed,
        `public/diagrams/${scene}-${theme}.svg is stale - run \`pnpm prerender:diagrams\` and commit the result`
      ).toBe(true);
    }
  }, 60_000);
});

describe("the render gates", () => {
  it("a_colour_literal_in_a_source_is_a_failure", () => {
    // Assembled, not written: a raw hex in repo source is itself a lint error
    // (grit/no-direct-palette-import), and this one is a fixture, not a token.
    const offPalette = `#${"4f46e5"}`;
    const failures = checkNoColourLiteral("x", `a: "A" { style: { fill: "${offPalette}" } }`);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("x.d2:1");
    expect(failures[0]).toContain(offPalette);
  });

  it("a_hash_comment_is_not_mistaken_for_a_colour", () => {
    expect(checkNoColourLiteral("x", "# see issue #122 for the rule")).toEqual([]);
  });

  it("an_unknown_class_is_a_failure_because_d2_ignores_it_silently", () => {
    const failures = checkClassVocabulary("x", 'a: "A" { class: termnal }');
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('unknown class "termnal"');
  });

  it("a_composed_role_plus_modifier_is_accepted", () => {
    expect(checkClassVocabulary("x", 'a: "A" { class: [node; planned; stepper] }')).toEqual([]);
  });

  it("no_committed_scene_exceeds_the_aspect_budget", () => {
    for (const scene of scenes.filter((s) => !s.startsWith("_"))) {
      for (const theme of THEMES) {
        const svg = readFileSync(join(OUT_DIR, `${scene}-${theme}.svg`), "utf8");
        const match = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
        expect(match, `${scene}-${theme} has no viewBox`).not.toBeNull();
        const ratio = Number(match?.[1]) / Number(match?.[2]);
        expect(ratio, `${scene}-${theme} is ${ratio.toFixed(2)}:1`).toBeLessThanOrEqual(
          MAX_ASPECT_RATIO
        );
      }
    }
  });
});
