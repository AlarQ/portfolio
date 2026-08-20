// PROTOTYPE (throwaway, branch prototype/d2-diagrams) - answers issue #116.
// Renders content/diagrams/prototype-d2/*.d2 as VARIANT x THEME SVGs into
// public/diagrams/prototype/<name>-<variant>-<theme>.svg.
//
// Structure lives in the .d2 source (semantic classes: consumer, planned,
// container, layer-*, state*, terminal, edge); LOOK lives in the per-variant
// prelude below - the thing being judged. Run: pnpm prototype:d2
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { D2 } from "@terrastruct/d2";
import { primitives as p } from "../src/theme/tokens.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "content", "diagrams", "prototype-d2");
const OUT = join(ROOT, "public", "diagrams", "prototype");

type Theme = "light" | "dark";
type Palette = {
  bg: string; surface: string; border: string; text: string; muted: string;
  violetBg: string; violetFg: string; orangeBg: string; orangeFg: string;
  greenBg: string; greenFg: string; indigoBg: string; indigoFg: string;
  grayBlueBg: string; grayBlueFg: string;
};

const LIGHT: Palette = {
  bg: p.white, surface: p.gray50, border: p.gray200, text: p.gray700, muted: p.bodyLight,
  violetBg: p.categoryVioletBg, violetFg: p.categoryVioletFg,
  orangeBg: p.categoryOrangeBg, orangeFg: p.categoryOrangeFg,
  greenBg: p.categoryGreenBg, greenFg: p.categoryGreenFg,
  indigoBg: p.categoryIndigoBg, indigoFg: p.categoryIndigoFg,
  grayBlueBg: p.categoryGrayBlueBg, grayBlueFg: p.categoryGrayBlueFg,
};
const DARK: Palette = {
  bg: p.backgroundDark, surface: p.cardDark, border: p.borderDark, text: p.bodyDark, muted: p.bodyDark,
  violetBg: p.cardDark, violetFg: p.shikiTokenFunction,
  orangeBg: p.cardDark, orangeFg: p.shikiTokenConstant,
  greenBg: p.cardDark, greenFg: p.shikiTokenString,
  indigoBg: p.cardDark, indigoFg: p.shikiTokenKeyword,
  grayBlueBg: p.cardDark, grayBlueFg: p.shikiTokenKeyword,
};

const cls = (body: string) => `classes: {\n${body}\n}\n`;

// A - TINTED: today's Excalidraw look, translated. Category tint fill + matching
// stroke, soft corners, hairline borders.
const tinted = (c: Palette) => cls(`
  consumer: { style: { fill: "${c.indigoBg}"; stroke: "${c.indigoFg}"; stroke-width: 1; border-radius: 8; font-color: "${c.text}" } }
  planned: { style: { fill: "${c.violetBg}"; stroke: "${c.violetFg}"; stroke-width: 1; stroke-dash: 4; border-radius: 8; font-color: "${c.text}" } }
  container: { style: { fill: "${c.surface}"; stroke: "${c.border}"; stroke-width: 1; border-radius: 8; font-color: "${c.muted}" } }
  layer-infra: { style: { fill: "${c.orangeBg}"; stroke: "${c.orangeFg}"; stroke-width: 1; border-radius: 8; font-color: "${c.text}" } }
  layer-app: { style: { fill: "${c.grayBlueBg}"; stroke: "${c.grayBlueFg}"; stroke-width: 1; border-radius: 8; font-color: "${c.text}" } }
  layer-domain: { style: { fill: "${c.greenBg}"; stroke: "${c.greenFg}"; stroke-width: 1; border-radius: 8; font-color: "${c.text}" } }
  state: { style: { fill: "${c.indigoBg}"; stroke: "${c.indigoFg}"; stroke-width: 1; border-radius: 8; font-color: "${c.text}" } }
  state-wait: { style: { fill: "${c.orangeBg}"; stroke: "${c.orangeFg}"; stroke-width: 1; border-radius: 8; font-color: "${c.text}" } }
  terminal: { style: { fill: "${c.greenBg}"; stroke: "${c.greenFg}"; stroke-width: 1; border-radius: 8; font-color: "${c.text}" } }
  edge: { style: { stroke: "${c.muted}"; stroke-width: 1; font-color: "${c.muted}"; font-size: 13 } }
`);

// B - INK: near-monochrome. Everything is surface + hairline border; ONE accent
// (indigo) marks the load-bearing node. Colour carries meaning, not decoration.
const ink = (c: Palette) => cls(`
  consumer: { style: { fill: "${c.bg}"; stroke: "${c.border}"; stroke-width: 1; border-radius: 6; font-color: "${c.text}" } }
  planned: { style: { fill: "${c.bg}"; stroke: "${c.border}"; stroke-width: 1; stroke-dash: 4; border-radius: 6; font-color: "${c.muted}" } }
  container: { style: { fill: "${c.surface}"; stroke: "${c.border}"; stroke-width: 1; border-radius: 6; font-color: "${c.muted}" } }
  layer-infra: { style: { fill: "${c.bg}"; stroke: "${c.border}"; stroke-width: 1; border-radius: 6; font-color: "${c.text}" } }
  layer-app: { style: { fill: "${c.bg}"; stroke: "${c.border}"; stroke-width: 1; border-radius: 6; font-color: "${c.text}" } }
  layer-domain: { style: { fill: "${c.bg}"; stroke: "${c.indigoFg}"; stroke-width: 2; border-radius: 6; font-color: "${c.text}" } }
  state: { style: { fill: "${c.bg}"; stroke: "${c.border}"; stroke-width: 1; border-radius: 6; font-color: "${c.text}" } }
  state-wait: { style: { fill: "${c.surface}"; stroke: "${c.border}"; stroke-width: 1; stroke-dash: 4; border-radius: 6; font-color: "${c.muted}" } }
  terminal: { style: { fill: "${c.bg}"; stroke: "${c.indigoFg}"; stroke-width: 2; border-radius: 6; font-color: "${c.text}" } }
  edge: { style: { stroke: "${c.border}"; stroke-width: 1; font-color: "${c.muted}"; font-size: 13 } }
`);

// C - SLAB: no fills at all. Sharp corners, 2px borders, bold labels - the
// typographic/editorial look. Structure reads from line weight, not from colour.
const slab = (c: Palette) => cls(`
  consumer: { style: { fill: transparent; stroke: "${c.text}"; stroke-width: 2; border-radius: 0; bold: true; font-color: "${c.text}" } }
  planned: { style: { fill: transparent; stroke: "${c.muted}"; stroke-width: 2; stroke-dash: 5; border-radius: 0; font-color: "${c.muted}" } }
  container: { style: { fill: transparent; stroke: "${c.border}"; stroke-width: 2; border-radius: 0; font-color: "${c.muted}"; bold: true } }
  layer-infra: { style: { fill: transparent; stroke: "${c.orangeFg}"; stroke-width: 2; border-radius: 0; font-color: "${c.text}" } }
  layer-app: { style: { fill: transparent; stroke: "${c.grayBlueFg}"; stroke-width: 2; border-radius: 0; font-color: "${c.text}" } }
  layer-domain: { style: { fill: transparent; stroke: "${c.greenFg}"; stroke-width: 2; border-radius: 0; font-color: "${c.text}" } }
  state: { style: { fill: transparent; stroke: "${c.text}"; stroke-width: 2; border-radius: 0; bold: true; font-color: "${c.text}" } }
  state-wait: { style: { fill: transparent; stroke: "${c.muted}"; stroke-width: 2; stroke-dash: 5; border-radius: 0; font-color: "${c.muted}" } }
  terminal: { style: { fill: transparent; stroke: "${c.greenFg}"; stroke-width: 2; border-radius: 0; bold: true; font-color: "${c.text}" } }
  edge: { style: { stroke: "${c.text}"; stroke-width: 2; font-color: "${c.muted}"; font-size: 13 } }
`);

export const VARIANTS = {
  a: { name: "Tinted - today's palette", prelude: tinted },
  b: { name: "Ink - monochrome + one accent", prelude: ink },
  c: { name: "Slab - no fills, 2px rules", prelude: slab },
} as const;

const config = (c: Palette) => `vars: {
  d2-config: {
    layout-engine: elk
    pad: 24
    sketch: false
    theme-overrides: { N1: "${c.text}"; N2: "${c.text}"; N7: "${c.bg}"; B1: "${c.text}"; B2: "${c.text}" }
  }
}
`;

const d2 = new D2();
await mkdir(OUT, { recursive: true });
const sources = (await readdir(SRC)).filter((f) => f.endsWith(".d2"));

for (const file of sources) {
  const name = file.replace(/\.d2$/, "");
  const body = await readFile(join(SRC, file), "utf8");
  for (const [key, variant] of Object.entries(VARIANTS)) {
    for (const theme of ["light", "dark"] as Theme[]) {
      const c = theme === "light" ? LIGHT : DARK;
      const src = config(c) + variant.prelude(c) + body;
      const r = await d2.compile(src, { options: { layout: "elk", themeID: 0, pad: 24, sketch: false } });
      // The WASM build emits an outer <svg> with a viewBox but NO width/height,
      // which collapses to 0 inside `<img class="h-auto">`. Stamp the intrinsic
      // size back on from the viewBox.
      const raw = await d2.render(r.diagram, r.renderOptions);
      const svg = raw.replace(
        /^(<\?xml[^>]*\?><svg )([^>]*viewBox="0 0 (\d+) (\d+)")/,
        (_m, head, attrs, w, h) => `${head}width="${w}" height="${h}" ${attrs}`
      );
      const out = join(OUT, `${name}-${key}-${theme}.svg`);
      await writeFile(out, svg);
      console.log(`${out}  ${(svg.length / 1024).toFixed(1)} KB`);
    }
  }
}
// The Go WASM runtime keeps the event loop alive (research #115, §1).
process.exit(0);
