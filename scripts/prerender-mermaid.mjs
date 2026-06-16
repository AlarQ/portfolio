// Pre-render Mermaid diagrams to committed SVGs.
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
// Idempotent: a diagram is re-rendered only when its `.mmd` source is newer
// than the committed `.svg` (mtime compare), so a no-op commit is fast.

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMermaidRenderer } from "mermaid-isomorphic";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "content", "diagrams");
const OUT_DIR = join(ROOT, "public", "diagrams");

// Mirrors the old `rehype-mermaid` `{ dark: true }` option so the pre-rendered
// SVGs keep the same dark palette the post was authored against.
const MERMAID_CONFIG = { theme: "dark" };

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.log(`[prerender-mermaid] no ${SRC_DIR} — nothing to render`);
    return;
  }

  const sources = (await readdir(SRC_DIR)).filter((name) => name.endsWith(".mmd")).sort();
  if (sources.length === 0) {
    console.log("[prerender-mermaid] no .mmd files — nothing to render");
    return;
  }

  const stale = [];
  for (const filename of sources) {
    const srcPath = join(SRC_DIR, filename);
    const outPath = join(OUT_DIR, filename.replace(/\.mmd$/, ".svg"));
    if (await isStale(srcPath, outPath)) {
      stale.push({ srcPath, outPath, filename });
    }
  }

  if (stale.length === 0) {
    console.log(`[prerender-mermaid] ${sources.length} diagram(s) up to date — skipping`);
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });
  const render = createMermaidRenderer();
  const definitions = await Promise.all(stale.map(({ srcPath }) => readFile(srcPath, "utf8")));

  let results;
  try {
    results = await render(definitions, { mermaidConfig: MERMAID_CONFIG });
  } catch (error) {
    failBrowser(error);
    return;
  }

  let failed = false;
  await Promise.all(
    results.map(async (result, index) => {
      const { outPath, filename } = stale[index];
      if (result.status === "rejected") {
        failed = true;
        console.error(`[prerender-mermaid] FAILED ${filename}: ${describe(result.reason)}`);
        return;
      }
      await writeFile(outPath, normalizeSvgSize(result.value.svg), "utf8");
      console.log(`[prerender-mermaid] rendered ${filename} → ${outPath.replace(`${ROOT}/`, "")}`);
    })
  );

  if (failed) {
    process.exitCode = 1;
  }
}

// Mermaid emits `<svg width="100%" ... viewBox="0 0 W H">`. Referenced through
// an `<img>`, that percentage width makes the browser stretch the diagram to
// fill the prose column, inflating its text far past the intended size relative
// to surrounding body copy. Pin the intrinsic px width/height from the viewBox
// so the diagram renders at its natural size and never upscales; the `<img>`
// `max-width: 100%` still downscales over-wide diagrams on narrow columns.
function normalizeSvgSize(svg) {
  const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!viewBox) return svg;
  const [, width, height] = viewBox;
  return svg.replace(/(<svg\b[^>]*?)\swidth="100%"/, `$1 width="${width}" height="${height}"`);
}

// A diagram is stale when its SVG is missing or older than the .mmd source.
async function isStale(srcPath, outPath) {
  if (!existsSync(outPath)) return true;
  const [src, out] = await Promise.all([stat(srcPath), stat(outPath)]);
  return src.mtimeMs > out.mtimeMs;
}

// `mermaid-isomorphic` needs a local Playwright Chromium. If it is missing the
// launch throws — surface the exact install command and fail non-zero so a
// commit can't silently ship stale diagrams.
function failBrowser(error) {
  const message = describe(error);
  console.error(`[prerender-mermaid] browser render failed: ${message}`);
  if (/launch|executable|browser/i.test(message)) {
    console.error("[prerender-mermaid] install the browser: npx playwright install chromium");
  }
  process.exitCode = 1;
}

function describe(reason) {
  return reason instanceof Error ? reason.message : String(reason);
}

main().catch((error) => {
  console.error(`[prerender-mermaid] unexpected error: ${describe(error)}`);
  process.exitCode = 1;
});
