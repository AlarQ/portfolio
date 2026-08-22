// Pre-render D2 diagrams to committed SVGs - one LIGHT + one DARK per scene, so
// a diagram tracks the page theme like a first-class figure (ADR-0005).
//
// Pipeline: `content/diagrams/<name>.d2` (structure + semantic classes, never a
// colour) + the theme prelude resolved from `src/theme/tokens.ts`
// (`scripts/diagram-lib/theme.ts`) -> `public/diagrams/<name>-{light,dark}.svg`,
// committed and staged by the pre-commit hook. D2 runs HERE and nowhere else:
// no CI step, nothing in `next build`, so Vercel's build image only ever sees
// committed SVGs.
//
// Every scene is re-rendered on every run, not just the ones that changed: the
// gates in `diagram-lib/render.ts` are cross-cutting, and a prelude edit breaks
// scenes that are not in the staged diff. The render is byte-deterministic, so
// re-rendering an unchanged scene rewrites identical bytes and stages nothing.
//
// This module is the I/O shell: reading, writing, and the exit code. The gates
// and the render itself live in `diagram-lib/render.ts`, which is what
// `src/theme/diagrams.test.ts` re-runs to prove the committed SVGs are fresh.

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { primitives } from "../src/theme/tokens.ts";
import { type PreviewJob, writePreviews } from "./diagram-lib/preview.ts";
import { renderScene } from "./diagram-lib/render.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "content", "diagrams");
const OUT_DIR = join(ROOT, "public", "diagrams");
const FONT_DIR = join(ROOT, "scripts", "diagram-lib", "fonts");
const PREVIEW_DIR = join(ROOT, ".diagram-preview");

// `--preview` also rasterizes each SVG to a gitignored PNG at prose-column
// width, so the authoring loop has something the Read tool can look at. Opt-in:
// it is the one step that needs a browser, and the pre-commit hook never asks
// for it.
const wantPreviews = process.argv.includes("--preview");
const PAGE_BACKGROUND = { light: primitives.white, dark: primitives.backgroundDark };

async function main(): Promise<void> {
  const sources = (await readdir(SRC_DIR)).filter((n) => n.endsWith(".d2")).sort();
  if (sources.length === 0) {
    console.log("[prerender-diagrams] no .d2 sources - nothing to render");
    return;
  }

  const [regular, bold] = await Promise.all([
    readFile(join(FONT_DIR, "Inter-Regular.ttf")),
    readFile(join(FONT_DIR, "Inter-Bold.ttf")),
  ]);
  const fonts = { regular: new Uint8Array(regular), bold: new Uint8Array(bold) };

  await mkdir(OUT_DIR, { recursive: true });
  if (wantPreviews) await mkdir(PREVIEW_DIR, { recursive: true });
  const failures: string[] = [];
  const previews: PreviewJob[] = [];

  for (const filename of sources) {
    const scene = filename.slice(0, -".d2".length);
    const source = await readFile(join(SRC_DIR, filename), "utf8");
    // `_`-prefixed sources are the exemplar board: rendered like any other scene
    // (so a broken class definition surfaces), exempt from the aspect budget
    // only, and unembeddable - `Diagram.tsx`'s slug regex rejects a leading `_`.
    const result = await renderScene(scene, source, fonts, {
      exemptFromAspect: scene.startsWith("_"),
    });
    failures.push(...result.failures);
    for (const [theme, svg] of Object.entries(result.svgs)) {
      const outPath = join(OUT_DIR, `${scene}-${theme}.svg`);
      await writeFile(outPath, svg, "utf8");
      if (wantPreviews) {
        previews.push({
          svg,
          outPath: join(PREVIEW_DIR, `${scene}-${theme}.png`),
          background: PAGE_BACKGROUND[theme as keyof typeof PAGE_BACKGROUND],
        });
      }
      console.log(`[prerender-diagrams] ${scene}-${theme}  ${(svg.length / 1024).toFixed(1)} KB`);
    }
  }

  if (wantPreviews) {
    await writePreviews(previews);
    console.log(`[prerender-diagrams] ${previews.length} preview PNG(s) in .diagram-preview/`);
  }

  if (failures.length > 0) {
    for (const failure of failures) console.error(`[prerender-diagrams] ${failure}`);
    console.error(`[prerender-diagrams] ${failures.length} failure(s)`);
    process.exitCode = 1;
  }
}

await main().catch((error) => {
  console.error(
    `[prerender-diagrams] unexpected error: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exitCode = 1;
});
// The Go WASM runtime keeps the event loop alive; exit explicitly.
process.exit(process.exitCode ?? 0);
