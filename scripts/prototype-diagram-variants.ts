// PROTOTYPE - throwaway (see content/diagrams/_prototype/README.md).
// Renders every _prototype scene once per LOOK VARIANT per theme into
// public/diagrams/_prototype/, so /prototype-diagrams?v=N can switch between
// them. Answers: uniform node size, title/subtitle hierarchy, terminal emphasis.
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { D2 } from "@terrastruct/d2";
import { primitives as p } from "../src/theme/tokens.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "content", "diagrams", "_prototype");
const OUT_DIR = join(ROOT, "public", "diagrams", "_prototype");
const FONT_DIR = join(ROOT, "scripts", "diagram-lib", "fonts");

type ThemeName = "light" | "dark";

const PALETTES = {
  light: {
    bg: p.white,
    surface: p.gray50,
    border: p.gray200,
    text: p.gray700,
    muted: p.bodyLight,
    nodeBg: p.categoryGrayBlueBg,
    nodeFg: p.categoryGrayBlueFg,
    emphasisBg: p.categoryIndigoBg,
    emphasisFg: p.categoryIndigoFg,
    terminalBg: p.categoryGreenBg,
    terminalFg: p.categoryGreenFg,
  },
  dark: {
    bg: p.backgroundDark,
    surface: p.cardDark,
    border: p.borderDark,
    text: p.bodyDark,
    muted: p.bodyDark,
    nodeBg: p.cardDark,
    nodeFg: p.bodyDark,
    emphasisBg: p.cardDark,
    emphasisFg: p.shikiTokenKeyword,
    terminalBg: p.cardDark,
    terminalFg: p.shikiTokenString,
  },
} as const;

interface Variant {
  id: string;
  name: string;
  note: string;
  width: number;
  height: number;
  fontSize: number;
  radius: number;
  /** Which source set feeds this variant. */
  source: "plain" | "md";
  /** Prefer a `grid/` rewrite of a scene when one exists (compact chain stack). */
  preferGrid?: boolean;
  /** Keep only the first line of every quoted label - the main word. */
  titleOnly?: boolean;
  /** Extra style D2 lines for the terminal class - how the end state earns its emphasis. */
  terminalExtra: string;
  /** Layout engine - elk leaves huge gaps around edge labels, dagre packs tighter. */
  layout: "elk" | "dagre";
  /** Drop every edge label - they are what makes a vertical chain tall. */
  noEdgeLabels?: boolean;
}

// Title-only won. The open question is now SIZE only: three steps down from the
// 260x60 that read as "still too big".
export const VARIANTS: Variant[] = [
  {
    id: "1",
    name: "Title-only 200x52",
    note: "one word per box, uniform 200x52 at 14px",
    source: "plain",
    titleOnly: true,
    layout: "elk",
    width: 200,
    height: 52,
    fontSize: 14,
    radius: 8,
    terminalExtra: "stroke-width: 2; double-border: true",
  },
  {
    id: "2",
    name: "Title-only 168x44 (dagre)",
    note: "one word per box, uniform 168x44 at 13px, dagre layout - tighter gaps",
    source: "plain",
    titleOnly: true,
    layout: "dagre",
    width: 168,
    height: 44,
    fontSize: 13,
    radius: 6,
    terminalExtra: "stroke-width: 2; double-border: true",
  },
  {
    id: "3",
    name: "168x44, grid-stacked chain",
    note: "same box as v2; the feature-flow chain is packed by a grid container (fixed 14px gap) instead of the layout engine's ~110px ranks - the rest of the scenes fall back to v2",
    source: "plain",
    titleOnly: true,
    layout: "dagre",
    noEdgeLabels: true,
    preferGrid: true,
    width: 168,
    height: 44,
    fontSize: 13,
    radius: 6,
    terminalExtra: "stroke-width: 2; double-border: true",
  },
];

function prelude(theme: ThemeName, v: Variant): string {
  const c = PALETTES[theme];
  const box = (fill: string, stroke: string, extra = "") =>
    `{ width: ${v.width}; height: ${v.height}; style: { fill: "${fill}"; stroke: "${stroke}"; stroke-width: 1; border-radius: ${v.radius}; font-color: "${c.text}"; font-size: ${v.fontSize}${extra === "" ? "" : `; ${extra}`} } }`;
  return `vars: {
  d2-config: {
    layout-engine: ${v.layout}
    pad: 24
    sketch: false
    theme-overrides: { N1: "${c.text}"; N2: "${c.text}"; N7: "${c.bg}"; B1: "${c.text}"; B2: "${c.text}" }
  }
}
classes: {
  node: ${box(c.nodeBg, c.nodeFg)}
  emphasis: ${box(c.emphasisBg, c.emphasisFg)}
  terminal: ${box(c.terminalBg, c.terminalFg, v.terminalExtra)}
  group: { style: { fill: "${c.surface}"; stroke: "${c.border}"; stroke-width: 1; border-radius: 8; font-color: "${c.muted}"; font-size: 15 } }
  edge: { style: { stroke: "${c.muted}"; stroke-width: 1; font-color: "${c.muted}"; font-size: 12 } }
  edge-feedback: { style: { stroke: "${c.muted}"; stroke-width: 1; stroke-dash: 4; font-color: "${c.muted}"; font-size: 12 } }
}
`;
}

const [regular, bold] = await Promise.all([
  readFile(join(FONT_DIR, "Inter-Regular.ttf")),
  readFile(join(FONT_DIR, "Inter-Bold.ttf")),
]);
const fonts = { fontRegular: new Uint8Array(regular), fontBold: new Uint8Array(bold) };

await mkdir(OUT_DIR, { recursive: true });

/** Variant 1: keep only the first line of a quoted label. */
const stripSubtitles = (source: string): string =>
  source.replace(/"([^"]*)"/g, (_all, label: string) => `"${label.split("\\n")[0]}"`);

/** Drop the `: "label"` from an edge line, keeping its class block. */
const stripEdgeLabels = (source: string): string =>
  source
    .split("\n")
    .map((line) => (line.includes("->") ? line.replace(/:\s*"[^"]*"/, "") : line))
    .join("\n");

for (const v of VARIANTS) {
  const dir = join(SRC_DIR, v.source);
  const scenes = (await readdir(dir)).filter((n) => n.endsWith(".d2")).sort();
  for (const filename of scenes) {
    const scene = filename.slice(0, -".d2".length);
    const gridPath = join(SRC_DIR, "grid", filename);
    const useGrid = v.preferGrid === true && existsSync(gridPath);
    const raw = await readFile(useGrid ? gridPath : join(dir, filename), "utf8");
    let source = v.titleOnly === true ? stripSubtitles(raw) : raw;
    if (v.noEdgeLabels === true) source = stripEdgeLabels(source);
    for (const theme of ["light", "dark"] as ThemeName[]) {
      const d2 = new D2();
      try {
        const result = await d2.compile(prelude(theme, v) + source, {
          options: { layout: v.layout, themeID: 0, pad: 24, sketch: false, ...fonts },
        });
        let svg = await d2.render(result.diagram, result.renderOptions);
        const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
        if (m !== null && !/<svg[^>]*\swidth="/.test(svg)) {
          svg = svg.replace(/<svg /, `<svg width="${m[1]}" height="${m[2]}" `);
        }
        await writeFile(join(OUT_DIR, `${scene}-v${v.id}-${theme}.svg`), svg, "utf8");
        console.log(`${scene} v${v.id} ${theme}  ${m?.[1]}x${m?.[2]}`);
      } catch (error) {
        console.error(
          `${scene} v${v.id} ${theme}: ${error instanceof Error ? error.message : error}`
        );
      }
    }
  }
}
process.exit(0);
