// Pre-render Mermaid diagrams to committed SVGs - one LIGHT + one DARK per
// source, so a Post diagram tracks the page theme like a first-class figure.
//
// Why this exists: the MDX pipeline used to run `rehype-mermaid` (img-svg),
// which launches a headless Chromium at BUILD time. Vercel's build image
// (Amazon Linux) has no Playwright browser/system libs, so production deploys
// failed with `browserType.launch: Executable doesn't exist`. The fix is to
// move the browser-backed render OUT of `next build` and into a local,
// pre-commit step: render `content/diagrams/*.mmd` → `public/diagrams/*.svg`
// here, commit the SVGs, and let `<Diagram>` reference them as static files.
// Vercel then serves owner-authored SVGs with no browser in CI.
//
// This file is the DIAGRAM PRESENTATION SEAM (CLAUDE.md seam pattern applied to
// diagrams): each `.mmd` declares STRUCTURE + a semantic ROLE per node (`class
// x plan`), never a colour. The palettes below resolve role → colour for the
// light and dark frames by PRIMITIVE NAME - never inline hex - so, like
// `scripts/generate-tokens.ts`, this script's only colour source is
// `src/theme/tokens.ts` (runs under Node's native TS strip, no `tsx`). The
// light tints are the category Badge hues; the dark strokes are the Shiki
// code-block palette, so a diagram and a code block are the same dark island.
// A role used in a `.mmd` with no palette entry THROWS - a missing entry is a
// fail-fast error, and a bad primitive name is a compile error (`PName`).
//
// Idempotent: a diagram is re-rendered only when a source `.mmd`, this script,
// OR the palette source `src/theme/tokens.ts` (where the primitive hexes live)
// is newer than the committed `.svg` - editing a primitive there invalidates
// every output even if no `.mmd` or this script changed.

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMermaidRenderer } from "mermaid-isomorphic";
import { primitives } from "../src/theme/tokens.ts";

const THIS_FILE = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(THIS_FILE), "..");
const SRC_DIR = join(ROOT, "content", "diagrams");
const OUT_DIR = join(ROOT, "public", "diagrams");
const TOKENS_FILE = join(ROOT, "src", "theme", "tokens.ts");

const FONT = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

type PName = keyof typeof primitives;
type Hue = [fill: PName, stroke: PName, text: PName];

// role → primitive names. Light = category Badge tints; dark node fill = the
// elevated dark card, strokes = the Shiki token palette (same as code blocks).
// The 9 roles collapse to 4 distinct hues per theme; each is defined ONCE here
// and shared by every role that wears it, so a hue tweak is a single edit.
const lightViolet: Hue = ["categoryVioletBg", "categoryVioletFg", "categoryVioletFg"];
const lightOrange: Hue = ["categoryOrangeBg", "categoryOrangeFg", "categoryOrangeFg"];
const lightGreen: Hue = ["categoryGreenBg", "categoryGreenFg", "categoryGreenFg"];
const lightIndigo: Hue = ["categoryIndigoBg", "categoryIndigoFg", "categoryIndigoFg"];
const lightGrayBlue: Hue = ["categoryGrayBlueBg", "categoryGrayBlueFg", "categoryGrayBlueFg"];
const LIGHT_ROLES: Record<string, Hue> = {
  plan: lightIndigo,
  build: lightGreen,
  verify: lightViolet,
  ship: lightOrange,
  gate: lightGrayBlue,
  agent: lightViolet,
  audit: lightOrange,
  sink: lightGreen,
  loop: lightViolet,
};
const darkViolet: Hue = ["cardDark", "shikiTokenFunction", "bodyDark"];
const darkOrange: Hue = ["cardDark", "shikiTokenConstant", "bodyDark"];
const darkGreen: Hue = ["cardDark", "shikiTokenString", "bodyDark"];
const darkIndigo: Hue = ["cardDark", "shikiTokenKeyword", "bodyDark"];
const darkGrayBlue: Hue = ["cardDark", "shikiTokenKeyword", "bodyDark"];
const DARK_ROLES: Record<string, Hue> = {
  plan: darkIndigo,
  build: darkGreen,
  verify: darkViolet,
  ship: darkOrange,
  gate: darkGrayBlue,
  agent: darkViolet,
  audit: darkOrange,
  sink: darkGreen,
  loop: darkViolet,
};

// Theme frame: subgraph container + edge/background primitive names. Light bg is
// white (= `--background` light); dark is the Figma dark frame (= `--background`
// dark), so `<Diagram>`'s token-framed box melts into the page in both themes.
interface Theme {
  roles: Record<string, Hue>;
  container: Hue;
  line: PName;
  bg: PName;
}
const THEMES: Record<string, Theme> = {
  light: {
    roles: LIGHT_ROLES,
    container: ["gray50", "gray200", "bodyLight"],
    line: "gray700",
    bg: "white",
  },
  dark: {
    roles: DARK_ROLES,
    container: ["backgroundDark", "borderDark", "bodyDark"],
    line: "bodyDark",
    bg: "backgroundDark",
  },
};

const SUBGRAPH_RE = /^\s*subgraph\s+([\w]+)\s*\[/gm;
const CLASS_RE = /^\s*class\s+[\w,]+\s+(\w+)\s*;?\s*$/gm;
const STRIP_RE = /^\s*(classDef|style)\b.*$/gm;

interface Parsed {
  body: string;
  roles: string[];
  subgraphs: string[];
}

/** Split a `.mmd` into its structural body and the roles/subgraphs it uses. */
function parse(source: string): Parsed {
  const roles = new Set<string>();
  for (const m of source.matchAll(CLASS_RE)) roles.add(m[1]);
  const subgraphs: string[] = [];
  for (const m of source.matchAll(SUBGRAPH_RE)) subgraphs.push(m[1]);
  // Defensive: a well-formed source has no colour literals, but strip any.
  const body = source
    .replace(STRIP_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
  return { body, roles: [...roles], subgraphs };
}

/** Resolve one parsed diagram + one theme into a renderable definition. */
function compose({ body, roles, subgraphs }: Parsed, themeName: string): string {
  const theme = THEMES[themeName];
  const [cFill, cStroke, cText] = theme.container;
  const defs = roles.map((role) => {
    const hue = theme.roles[role];
    if (!hue) {
      throw new Error(`[prerender-mermaid] role "${role}" has no ${themeName} palette entry`);
    }
    const [fill, stroke, text] = hue;
    return `  classDef ${role} fill:${primitives[fill]},stroke:${primitives[stroke]},stroke-width:2px,color:${primitives[text]};`;
  });
  const styles = subgraphs.map(
    (id) =>
      `  style ${id} fill:${primitives[cFill]},stroke:${primitives[cStroke]},stroke-width:1px,color:${primitives[cText]};`
  );
  return `${body}\n\n${[...defs, ...styles].join("\n")}\n`;
}

// Mermaid emits `<svg width="100%" ... viewBox="0 0 W H">`. Referenced through
// an `<img>`, that percentage width stretches the diagram to fill the prose
// column, inflating its text past the surrounding body copy. Pin the intrinsic
// px width/height from the viewBox so it renders at natural size; the `<img>`
// `max-width: 100%` still downscales over-wide diagrams on narrow columns.
function normalizeSvgSize(svg: string): string {
  const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!viewBox) return svg;
  const [, width, height] = viewBox;
  return svg.replace(/(<svg\b[^>]*?)\swidth="100%"/, `$1 width="${width}" height="${height}"`);
}

// An SVG is stale when missing, or older than its .mmd source or the palette
// (the newer of this script and `src/theme/tokens.ts`, where the primitive
// hexes live) - so a palette edit in tokens.ts must re-render everything.
async function isStale(srcPath: string, outPath: string, paletteMtime: number): Promise<boolean> {
  if (!existsSync(outPath)) return true;
  const [src, out] = await Promise.all([stat(srcPath), stat(outPath)]);
  return src.mtimeMs > out.mtimeMs || paletteMtime > out.mtimeMs;
}

// `mermaid-isomorphic` needs a local Playwright Chromium. If it is missing the
// launch throws - surface the exact install command and fail non-zero so a
// commit can't silently ship stale diagrams.
function failBrowser(error: unknown): void {
  const message = describe(error);
  console.error(`[prerender-mermaid] browser render failed: ${message}`);
  if (/launch|executable|browser/i.test(message)) {
    console.error("[prerender-mermaid] install the browser: pnpm exec playwright install chromium");
  }
  process.exitCode = 1;
}

function describe(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

async function main(): Promise<void> {
  if (!existsSync(SRC_DIR)) {
    console.log(`[prerender-mermaid] no ${SRC_DIR} - nothing to render`);
    return;
  }

  const sources = (await readdir(SRC_DIR)).filter((n) => n.endsWith(".mmd")).sort();
  if (sources.length === 0) {
    console.log("[prerender-mermaid] no .mmd files - nothing to render");
    return;
  }

  // The effective palette source is the newer of this script and tokens.ts
  // (where the primitive hexes live); either edit invalidates every SVG.
  const [scriptStat, tokensStat] = await Promise.all([stat(THIS_FILE), stat(TOKENS_FILE)]);
  const paletteMtime = Math.max(scriptStat.mtimeMs, tokensStat.mtimeMs);

  // One render job per (source, theme) pair whose SVG is stale.
  const stale: Array<{ srcPath: string; outPath: string; base: string; themeName: string }> = [];
  for (const filename of sources) {
    const srcPath = join(SRC_DIR, filename);
    const base = filename.replace(/\.mmd$/, "");
    for (const themeName of Object.keys(THEMES)) {
      const outPath = join(OUT_DIR, `${base}-${themeName}.svg`);
      if (await isStale(srcPath, outPath, paletteMtime)) {
        stale.push({ srcPath, outPath, base, themeName });
      }
    }
  }

  if (stale.length === 0) {
    console.log(`[prerender-mermaid] ${sources.length} diagram(s) up to date - skipping`);
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });
  const render = createMermaidRenderer();

  // Parse each needed source once; mermaidConfig is per-render, so render each
  // (source, theme) job with its own theme config.
  const parsed = new Map<string, Parsed>();
  let failed = false;
  for (const job of stale) {
    if (!parsed.has(job.srcPath)) {
      parsed.set(job.srcPath, parse(await readFile(job.srcPath, "utf8")));
    }
    const theme = THEMES[job.themeName];
    const def = compose(parsed.get(job.srcPath) as Parsed, job.themeName);

    let result: Awaited<ReturnType<typeof render>>[number];
    try {
      [result] = await render([def], {
        mermaidConfig: {
          theme: "base",
          themeVariables: {
            fontFamily: FONT,
            lineColor: primitives[theme.line],
            background: primitives[theme.bg],
          },
        },
      });
    } catch (error) {
      failBrowser(error);
      return;
    }

    if (result.status === "rejected") {
      failed = true;
      console.error(
        `[prerender-mermaid] FAILED ${job.base}-${job.themeName}: ${describe(result.reason)}`
      );
      continue;
    }
    await writeFile(job.outPath, normalizeSvgSize(result.value.svg), "utf8");
    console.log(
      `[prerender-mermaid] rendered ${job.base}-${job.themeName} → ${job.outPath.replace(`${ROOT}/`, "")}`
    );
  }

  if (failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[prerender-mermaid] unexpected error: ${describe(error)}`);
  process.exitCode = 1;
});
