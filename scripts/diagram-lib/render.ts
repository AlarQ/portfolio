// Renders one Excalidraw scene to an SVG string via a headless Chromium page
// that loads `@excalidraw/excalidraw`'s `exportToSvg` from esm.sh - ported
// from `scripts/prototype-excalidraw.ts`. Colours are already resolved into
// the scene per theme by `Builder` (see `palette.ts`), so this module never
// uses Excalidraw's `exportWithDarkMode` - each theme gets its own scene.

import { chromium } from "playwright";
import type { ThemeName } from "./palette.ts";

const EXCALIDRAW_VERSION = "0.17.6";
const EXCALIDRAW_ESM = `https://esm.sh/@excalidraw/excalidraw@${EXCALIDRAW_VERSION}`;
const ASSETS = `https://esm.sh/@excalidraw/excalidraw@${EXCALIDRAW_VERSION}/dist/excalidraw-assets`;

// esm.sh's build bakes `@excalidraw/excalidraw@undefined` into the SVG's
// @font-face src, so the hand-drawn Virgil/Cascadia fonts 404 and text falls
// back to a serif. Fetch each woff2 once and inline it as a base64 data URI
// so the committed SVG is self-contained (no runtime font fetch, works
// offline / on Vercel).
const fontCache = new Map<string, string>();
async function inlineFonts(svg: string): Promise<string> {
  const urls = new Set([...svg.matchAll(/url\("([^"]+\.woff2)"\)/g)].map((m) => m[1]));
  let out = svg;
  for (const url of urls) {
    const file = url.split("/").pop() as string;
    if (!fontCache.has(file)) {
      const buf = Buffer.from(await (await fetch(`${ASSETS}/${file}`)).arrayBuffer());
      fontCache.set(file, `data:font/woff2;base64,${buf.toString("base64")}`);
    }
    out = out.split(`url("${url}")`).join(`url("${fontCache.get(file) as string}")`);
  }
  return out;
}

// Mermaid emits `width="100%"`; mirror that normalization here so a
// referenced `<img>` renders at the diagram's natural size instead of
// stretching to fill the prose column (the `<img>` `max-width: 100%` still
// downscales over-wide diagrams on narrow columns).
function normalizeSvgSize(svg: string): string {
  const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!viewBox) return svg;
  const [, width, height] = viewBox;
  return svg.replace(/(<svg\b[^>]*?)\swidth="100%"/, `$1 width="${width}" height="${height}"`);
}

let browserPromise: ReturnType<typeof chromium.launch> | null = null;
function getBrowser() {
  if (!browserPromise) browserPromise = chromium.launch();
  return browserPromise;
}

/** Render a finished Excalidraw scene to a self-contained SVG string for one theme. */
export async function renderSceneToSvg(scene: object, theme: ThemeName): Promise<string> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // exportToSvg needs a real DOM; a blank about:blank page is enough.
    await page.goto("about:blank");
    const { elements, files } = scene as { elements: unknown[]; files?: unknown };
    const svg = await page.evaluate(
      async ({ esm, elements, files, theme }) => {
        const mod = await import(/* @vite-ignore */ esm);
        const exportToSvg = (mod.default ?? mod).exportToSvg;
        const result = await exportToSvg({
          elements,
          files: files ?? null,
          appState: {
            exportBackground: false,
            exportWithDarkMode: false,
            theme,
            viewBackgroundColor: "transparent",
          },
        });
        return result.outerHTML as string;
      },
      { esm: EXCALIDRAW_ESM, elements, files, theme }
    );
    return normalizeSvgSize(await inlineFonts(svg));
  } finally {
    await page.close();
  }
}

/** Close the shared headless browser; call once after all renders are done. */
export async function closeRenderer(): Promise<void> {
  if (!browserPromise) return;
  const browser = await browserPromise;
  browserPromise = null;
  await browser.close();
}
