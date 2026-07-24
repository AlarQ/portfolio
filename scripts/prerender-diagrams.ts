// Pre-render Excalidraw diagrams to committed SVGs - one LIGHT + one DARK per
// spec, so a Post diagram tracks the page theme like a first-class figure.
//
// Why this exists: `exportToSvg` needs a real DOM (headless Chromium), and
// Vercel's build image has no browser/system libs, so this render step stays
// OUT of `next build` and runs as a local, pre-commit step instead (mirrors
// the Mermaid pipeline it replaces - see `docs/adr/0003-excalidraw-for-diagrams.md`):
// render `content/diagrams/*.diagram.ts` → `public/diagrams/<name>-{light,dark}.svg`
// here, commit the SVGs, and let `<Diagram>` reference them as static files.
//
// Each `.diagram.ts` is a role-tagged builder spec (CLAUDE.md "diagram presentation
// seam" applied to diagrams): it lays out boxes/containers/arrows via `Builder`,
// tagging every shape with a semantic ROLE (`plan`, `build`, ...), never a colour.
// `scripts/diagram-lib/palette.ts` resolves role → colour per theme from
// `src/theme/tokens.ts` primitives - the only colour source. A role with no
// palette entry is a compile error (the palette's role table is exhaustive).
//
// Idempotent: a diagram is re-rendered only when its spec file, any
// `scripts/diagram-lib/*.ts` file, this script, OR `src/theme/tokens.ts` (where
// the primitive hexes live) is newer than the committed `.svg`.

import { existsSync } from "node:fs";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Builder as BuilderClass } from "./diagram-lib/builder.ts";
import { Builder } from "./diagram-lib/builder.ts";
import type { ThemeName } from "./diagram-lib/palette.ts";
import { closeRenderer, renderSceneToSvg } from "./diagram-lib/render.ts";

const THIS_FILE = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(THIS_FILE), "..");
const SRC_DIR = join(ROOT, "content", "diagrams");
const OUT_DIR = join(ROOT, "public", "diagrams");
const LIB_DIR = join(ROOT, "scripts", "diagram-lib");
const TOKENS_FILE = join(ROOT, "src", "theme", "tokens.ts");

const THEMES: ThemeName[] = ["light", "dark"];

interface DiagramSpec {
  name: string;
  alt: string;
  build: (b: BuilderClass) => void;
}

// An SVG is stale when missing, or older than its spec source or the shared
// engine mtime (the newest of this script, every diagram-lib/*.ts file, and
// tokens.ts, where the primitive hexes live) - so a palette or builder edit
// re-renders every diagram even if no spec changed.
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

async function main(): Promise<void> {
  if (!existsSync(SRC_DIR)) {
    console.log(`[prerender-diagrams] no ${SRC_DIR} - nothing to render`);
    return;
  }

  const sourceFiles = (await readdir(SRC_DIR)).filter((n) => n.endsWith(".diagram.ts")).sort();
  if (sourceFiles.length === 0) {
    console.log("[prerender-diagrams] no .diagram.ts files - nothing to render");
    return;
  }

  // The effective engine mtime is the newest of this script, every
  // diagram-lib/*.ts file, and tokens.ts; any of those edits invalidates
  // every SVG.
  const libFiles = (await readdir(LIB_DIR)).filter((n) => n.endsWith(".ts"));
  const engineFiles = [THIS_FILE, TOKENS_FILE, ...libFiles.map((n) => join(LIB_DIR, n))];
  const engineStats = await Promise.all(engineFiles.map((f) => stat(f)));
  const engineMtime = Math.max(...engineStats.map((s) => s.mtimeMs));

  const stale: Array<{
    srcPath: string;
    outPath: string;
    base: string;
    theme: ThemeName;
    spec: DiagramSpec;
  }> = [];
  let total = 0;
  for (const filename of sourceFiles) {
    const srcPath = join(SRC_DIR, filename);
    const mod = (await import(srcPath)) as DiagramSpec;
    const base = mod.name;
    for (const theme of THEMES) {
      total += 1;
      const outPath = join(OUT_DIR, `${base}-${theme}.svg`);
      if (await isStale(srcPath, outPath, engineMtime)) {
        stale.push({ srcPath, outPath, base, theme, spec: mod });
      }
    }
  }

  if (stale.length === 0) {
    console.log(`[prerender-diagrams] ${total} diagram(s) up to date - skipping`);
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });

  let failed = false;
  for (const job of stale) {
    const b = new Builder(job.theme);
    job.spec.build(b);
    let svg: string;
    try {
      svg = await renderSceneToSvg(b.scene(), job.theme);
    } catch (error) {
      failBrowser(error);
      failed = true;
      continue;
    }
    await writeFile(job.outPath, svg, "utf8");
    console.log(
      `[prerender-diagrams] rendered ${job.base}-${job.theme} → ${job.outPath.replace(`${ROOT}/`, "")}`
    );
  }

  await closeRenderer();
  if (failed) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(`[prerender-diagrams] unexpected error: ${describe(error)}`);
  process.exitCode = 1;
  await closeRenderer();
});
