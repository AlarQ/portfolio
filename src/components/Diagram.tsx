import { existsSync } from "node:fs";
import { join } from "node:path";
import { cn } from "@/lib/utils";
import { MDX_FRAME_CLASS } from "@/utils/mdxPresentationBlock";

/**
 * Renders a pre-rendered Mermaid diagram as a theme-tracking figure: a LIGHT
 * SVG shown in light mode and a DARK SVG shown in dark mode (`public/diagrams/
 * <name>-light.svg` / `<name>-dark.svg`), swapped by the `.dark` class the site
 * theme toggle drives — no client JS. The two SVGs are rendered from ONE
 * `content/diagrams/<name>.mmd` at commit time (see `scripts/prerender-mermaid.ts`,
 * the diagram presentation seam); Mermaid is not rendered during `next build`
 * (that launched a headless Chromium and broke Vercel's browserless image).
 *
 * The frame's `bg-background` is white in light and `#090d1f` in dark — the same
 * backgrounds the two SVGs bake in — so the figure melts into the page in both
 * themes instead of punching a light/dark box into the prose.
 *
 * Security: `name` is validated against the same `^[a-z0-9-]+$` slug pattern the
 * Post loader uses, so it can never escape `public/diagrams` or be joined as
 * arbitrary input to the filesystem (CLAUDE.md "never join arbitrary input to
 * fs"). A missing/invalid diagram THROWS at build time — fail-fast, never an
 * empty box in a shipped page.
 */
const DIAGRAM_NAME_PATTERN = /^[a-z0-9-]+$/;

export function Diagram({ name, alt }: { name: string; alt: string }) {
  if (!DIAGRAM_NAME_PATTERN.test(name)) {
    throw new Error(`[Diagram] invalid name "${name}": must match ${DIAGRAM_NAME_PATTERN}`);
  }

  for (const theme of ["light", "dark"] as const) {
    const svgPath = join(process.cwd(), "public", "diagrams", `${name}-${theme}.svg`);
    if (!existsSync(svgPath)) {
      throw new Error(
        `[Diagram] missing ${theme} diagram "${name}": expected ${svgPath}. Run \`npm run prerender:mermaid\`.`
      );
    }
  }

  return (
    <figure
      role="img"
      aria-label={alt}
      className={cn(MDX_FRAME_CLASS, "overflow-x-auto bg-background")}
    >
      {/* Accessible name lives on the figure (theme-independent); both imgs are decorative. */}
      {/* biome-ignore lint/performance/noImgElement: pre-rendered Mermaid SVG from the MDX body, not an app-rendered image */}
      <img
        src={`/diagrams/${name}-light.svg`}
        alt=""
        aria-hidden="true"
        className="mx-auto block h-auto max-w-full dark:hidden"
      />
      {/* biome-ignore lint/performance/noImgElement: pre-rendered Mermaid SVG from the MDX body, not an app-rendered image */}
      <img
        src={`/diagrams/${name}-dark.svg`}
        alt=""
        aria-hidden="true"
        className="mx-auto hidden h-auto max-w-full dark:block"
      />
    </figure>
  );
}
