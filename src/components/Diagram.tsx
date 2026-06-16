import { existsSync } from "node:fs";
import { join } from "node:path";
import { MdxImage } from "@/utils/mdxPresentationBlock";

/**
 * Renders a pre-rendered Mermaid diagram from `public/diagrams/<name>.svg`.
 *
 * Mermaid is no longer rendered during `next build` (that launched a headless
 * Chromium and broke Vercel's browserless build image). Instead a pre-commit
 * step renders `content/diagrams/*.mmd` → `public/diagrams/*.svg` (see
 * `scripts/prerender-mermaid.mjs`), and a Post body references the result by
 * name through this server component.
 *
 * Security: `name` is validated against the same `^[a-z0-9-]+$` slug pattern the
 * Post loader uses, so it can never escape `public/diagrams` or be joined as
 * arbitrary input to the filesystem (CLAUDE.md "never join arbitrary input to
 * fs"). A missing/invalid diagram THROWS at build time — fail-fast, never an
 * empty box in a shipped page. Visual framing is reused from `MdxImage`, the
 * single image presentation seam.
 */
const DIAGRAM_NAME_PATTERN = /^[a-z0-9-]+$/;

export function Diagram({ name, alt }: { name: string; alt: string }) {
  if (!DIAGRAM_NAME_PATTERN.test(name)) {
    throw new Error(`[Diagram] invalid name "${name}": must match ${DIAGRAM_NAME_PATTERN}`);
  }

  const svgPath = join(process.cwd(), "public", "diagrams", `${name}.svg`);
  if (!existsSync(svgPath)) {
    throw new Error(
      `[Diagram] missing diagram "${name}": expected ${svgPath}. Run \`npm run prerender:mermaid\`.`
    );
  }

  return <MdxImage src={`/diagrams/${name}.svg`} alt={alt} />;
}
