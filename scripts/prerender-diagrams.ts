// Pre-render Excalidraw diagrams to committed SVGs - one LIGHT + one DARK per
// scene, so a Post diagram tracks the page theme like a first-class figure.
//
// Why this exists: `exportToSvg` needs a real DOM (headless Chromium), and
// Vercel's build image has no browser/system libs, so this render step stays
// OUT of `next build` and runs as a local, pre-commit step instead (mirrors
// the Mermaid pipeline it replaces - see `docs/adr/0003-excalidraw-for-diagrams.md`):
// render `content/diagrams/*.excalidraw` → `public/diagrams/<name>-{light,dark}.svg`
// here, commit the SVGs, and let `<Diagram>` reference them as static files.
//
// Each `.excalidraw` file is a native Excalidraw scene, authored in the LIGHT
// palette (hand-editable in any Excalidraw client, or as raw JSON by an LLM -
// see `docs/adr/0004-native-excalidraw-source.md`). The dark scene is derived
// by `scripts/diagram-lib/theme.ts`'s exhaustive hex swap; an off-palette
// colour throws rather than silently rendering (`scripts/diagram-lib/palette.ts`).
//
// Files starting with `_` (e.g. `_palette.excalidraw`, a swatch reference
// sheet) are skipped - they are authoring aids, not renderable diagrams.
//
// Idempotent: a diagram is re-rendered only when its source file, any
// `scripts/diagram-lib/*.ts` file, this script, OR `src/theme/tokens.ts` (where
// the primitive hexes live) is newer than the committed `.svg`.

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ThemeName } from "./diagram-lib/palette.ts";
import { closeRenderer, rasterizeSvg, renderSceneToSvg } from "./diagram-lib/render.ts";
import { toDarkScene } from "./diagram-lib/theme.ts";

const THIS_FILE = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(THIS_FILE), "..");
const SRC_DIR = join(ROOT, "content", "diagrams");
const OUT_DIR = join(ROOT, "public", "diagrams");
const PREVIEW_DIR = join(ROOT, ".diagram-preview");
const LIB_DIR = join(ROOT, "scripts", "diagram-lib");
const TOKENS_FILE = join(ROOT, "src", "theme", "tokens.ts");

const THEMES: ThemeName[] = ["light", "dark"];

// An SVG is stale when missing, or older than its source scene or the shared
// engine mtime (the newest of this script, every diagram-lib/*.ts file, and
// tokens.ts, where the primitive hexes live) - so a palette engine edit
// re-renders every diagram even if no scene changed.
async function isStale(srcPath: string, outPath: string, engineMtime: number): Promise<boolean> {
  if (!existsSync(outPath)) return true;
  const [src, out] = await Promise.all([stat(srcPath), stat(outPath)]);
  return src.mtimeMs > out.mtimeMs || engineMtime > out.mtimeMs;
}

function describe(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

function failBrowser(error: unknown): void {
  const message = describe(error);
  console.error(`[prerender-diagrams] browser render failed: ${message}`);
  if (/launch|executable|browser/i.test(message)) {
    console.error(
      "[prerender-diagrams] install the browser: pnpm exec playwright install chromium"
    );
  }
  process.exitCode = 1;
}

interface StaleJob {
  srcPath: string;
  outPath: string;
  previewPath: string;
  base: string;
  theme: ThemeName;
}

async function main(): Promise<void> {
  if (!existsSync(SRC_DIR)) {
    console.log(`[prerender-diagrams] no ${SRC_DIR} - nothing to render`);
    return;
  }

  const sourceFiles = (await readdir(SRC_DIR))
    .filter((n) => n.endsWith(".excalidraw") && !n.startsWith("_"))
    .sort();
  if (sourceFiles.length === 0) {
    console.log("[prerender-diagrams] no .excalidraw files - nothing to render");
    return;
  }

  // The effective engine mtime is the newest of this script, every
  // diagram-lib/*.ts file, and tokens.ts; any of those edits invalidates
  // every SVG.
  const libFiles = (await readdir(LIB_DIR)).filter((n) => n.endsWith(".ts"));
  const engineFiles = [THIS_FILE, TOKENS_FILE, ...libFiles.map((n) => join(LIB_DIR, n))];
  const engineStats = await Promise.all(engineFiles.map((f) => stat(f)));
  const engineMtime = Math.max(...engineStats.map((s) => s.mtimeMs));

  const stale: StaleJob[] = [];
  let total = 0;
  for (const filename of sourceFiles) {
    const srcPath = join(SRC_DIR, filename);
    const base = filename.slice(0, -".excalidraw".length);
    for (const theme of THEMES) {
      total += 1;
      const outPath = join(OUT_DIR, `${base}-${theme}.svg`);
      const previewPath = join(PREVIEW_DIR, `${base}-${theme}.png`);
      if (await isStale(srcPath, outPath, engineMtime)) {
        stale.push({ srcPath, outPath, previewPath, base, theme });
      }
    }
  }

  if (stale.length === 0) {
    console.log(`[prerender-diagrams] ${total} diagram(s) up to date - skipping`);
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(PREVIEW_DIR, { recursive: true });

  // Parse each stale source once (a scene backs both its light and dark job).
  const parsed = new Map<string, object>();
  let failed = false;

  for (const job of stale) {
    let lightScene = parsed.get(job.srcPath);
    if (lightScene === undefined) {
      try {
        const raw = await readFile(job.srcPath, "utf8");
        lightScene = JSON.parse(raw) as object;
        parsed.set(job.srcPath, lightScene);
      } catch (error) {
        console.error(
          `[prerender-diagrams] failed to parse ${job.srcPath.replace(`${ROOT}/`, "")}: ${describe(error)}`
        );
        failed = true;
        continue;
      }
    }

    let scene: object;
    try {
      scene = job.theme === "dark" ? toDarkScene(lightScene) : lightScene;
    } catch (error) {
      console.error(`[prerender-diagrams] ${job.base}-${job.theme}: ${describe(error)}`);
      failed = true;
      continue;
    }

    let svg: string;
    try {
      svg = await renderSceneToSvg(scene, job.theme);
    } catch (error) {
      failBrowser(error);
      failed = true;
      continue;
    }
    await writeFile(job.outPath, svg, "utf8");
    console.log(
      `[prerender-diagrams] rendered ${job.base}-${job.theme} → ${job.outPath.replace(`${ROOT}/`, "")}`
    );

    try {
      await rasterizeSvg(svg, job.previewPath);
    } catch (error) {
      console.error(
        `[prerender-diagrams] preview PNG failed for ${job.base}-${job.theme}: ${describe(error)}`
      );
      failed = true;
    }
  }

  await closeRenderer();
  if (failed) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(`[prerender-diagrams] unexpected error: ${describe(error)}`);
  process.exitCode = 1;
  await closeRenderer();
});
