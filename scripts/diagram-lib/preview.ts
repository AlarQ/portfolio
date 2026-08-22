/**
 * Optional preview PNGs for the authoring loop - `pnpm prerender:diagrams --preview`.
 *
 * A diagram cannot be judged from its source, and the Read tool renders PNG,
 * not SVG. So the authoring loop (see the `d2-diagram` skill) rasterizes the
 * committed SVGs to `.diagram-preview/<name>-<theme>.png`, gitignored, at the
 * ~640px prose column width so what you look at is what a reader gets.
 *
 * This is the ONLY part of the pipeline that touches a browser, it is opt-in,
 * and it never runs in the pre-commit hook - the committed SVGs are produced by
 * the pure-WASM render alone (ADR-0005).
 */
import { chromium } from "playwright";

/** The prose column the diagram lands in; previews are rasterized at 2x for legibility. */
const COLUMN_WIDTH = 640;
const SCALE = 2;

export interface PreviewJob {
  svg: string;
  outPath: string;
  /** Page background, so the preview shows the diagram on the theme it ships on. */
  background: string;
}

export async function writePreviews(jobs: PreviewJob[]): Promise<void> {
  if (jobs.length === 0) return;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: COLUMN_WIDTH, height: 800 },
      deviceScaleFactor: SCALE,
    });
    for (const job of jobs) {
      const data = Buffer.from(job.svg.replace(/<\?xml[^>]*\?>/, "")).toString("base64");
      await page.setContent(
        `<body style="margin:0;background:${job.background}"><img src="data:image/svg+xml;base64,${data}" style="width:100%;height:auto;display:block"></body>`
      );
      await page.waitForTimeout(150);
      await page.screenshot({ path: job.outPath, fullPage: true });
    }
  } finally {
    await browser.close();
  }
}
