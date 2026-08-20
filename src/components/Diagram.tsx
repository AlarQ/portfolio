import { existsSync } from "node:fs";
import { join } from "node:path";
import { cn } from "@/lib/utils";
import { MDX_FRAME_CLASS } from "@/utils/mdxPresentationBlock";

/**
 * Renders a pre-rendered diagram as a theme-tracking figure: a LIGHT
 * SVG shown in light mode and a DARK SVG shown in dark mode (`public/diagrams/
 * <name>-light.svg` / `<name>-dark.svg`), swapped by the `.dark` class the site
 * theme toggle drives - no client JS. The two SVGs are rendered from ONE
 * `content/diagrams/<name>.excalidraw` at commit time (see `scripts/prerender-diagrams.ts`,
 * the diagram presentation seam); diagrams are not rendered during `next build`
 * (that launched a headless Chromium and broke Vercel's browserless image).
 *
 * The frame's `bg-background` is white in light and `#090d1f` in dark - the same
 * backgrounds the two SVGs bake in - so the figure melts into the page in both
 * themes instead of punching a light/dark box into the prose.
 *
 * Security: `name` is validated against the same `^[a-z0-9-]+$` slug pattern the
 * Post loader uses, so it can never escape `public/diagrams` or be joined as
 * arbitrary input to the filesystem (CLAUDE.md "never join arbitrary input to
 * fs"). A missing/invalid diagram THROWS at build time - fail-fast, never an
 * empty box in a shipped page.
 */

/**
 * PROTOTYPE (throwaway, branch prototype/d2-diagrams) - issue #116.
 * For the two prototyped scenes, ship every D2 look variant plus today's
 * Excalidraw render and let `PrototypeDiagramSwitcher` pick one via the
 * `data-dvariant` attribute on <html> (CSS gate in globals.css). SSG-safe:
 * no searchParams, no dynamic rendering.
 */
const PROTOTYPE_D2_SCENES = new Set([
  "bondsmith-architecture",
  "task-states",
  "feature-flow",
  "validate-panel",
  "learning-loop",
  "hyperion-monorepo-migration",
]);
const PROTOTYPE_D2_VARIANTS = ["a"] as const;

function PrototypeD2Figure({ name, alt }: { name: string; alt: string }) {
  return (
    <figure
      role="img"
      aria-label={alt}
      className={cn(MDX_FRAME_CLASS, "overflow-x-auto bg-background")}
    >
      {PROTOTYPE_D2_VARIANTS.flatMap((variant) =>
        (["light", "dark"] as const).map((theme) => (
          // biome-ignore lint/performance/noImgElement: prototype diagram SVG
          <img
            key={`${variant}-${theme}`}
            src={`/diagrams/prototype/${name}-${variant}-${theme}.svg`}
            alt=""
            aria-hidden="true"
            className={`dproto dproto-${variant}-${theme} mx-auto h-auto max-w-full`}
          />
        ))
      )}
      {(["light", "dark"] as const).map((theme) => (
        // biome-ignore lint/performance/noImgElement: prototype diagram SVG
        <img
          key={`x-${theme}`}
          src={`/diagrams/${name}-${theme}.svg`}
          alt=""
          aria-hidden="true"
          className={`dproto dproto-x-${theme} mx-auto h-auto max-w-full`}
        />
      ))}
    </figure>
  );
}

const DIAGRAM_NAME_PATTERN = /^[a-z0-9-]+$/;

export function Diagram({ name, alt }: { name: string; alt: string }) {
  if (!DIAGRAM_NAME_PATTERN.test(name)) {
    throw new Error(`[Diagram] invalid name "${name}": must match ${DIAGRAM_NAME_PATTERN}`);
  }

  if (PROTOTYPE_D2_SCENES.has(name)) return <PrototypeD2Figure name={name} alt={alt} />;

  for (const theme of ["light", "dark"] as const) {
    const svgPath = join(process.cwd(), "public", "diagrams", `${name}-${theme}.svg`);
    if (!existsSync(svgPath)) {
      throw new Error(
        `[Diagram] missing ${theme} diagram "${name}": expected ${svgPath}. Run \`pnpm prerender:diagrams\`.`
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
      {/* biome-ignore lint/performance/noImgElement: pre-rendered diagram SVG from the MDX body, not an app-rendered image */}
      <img
        src={`/diagrams/${name}-light.svg`}
        alt=""
        aria-hidden="true"
        className="mx-auto block h-auto max-w-full dark:hidden"
      />
      {/* biome-ignore lint/performance/noImgElement: pre-rendered diagram SVG from the MDX body, not an app-rendered image */}
      <img
        src={`/diagrams/${name}-dark.svg`}
        alt=""
        aria-hidden="true"
        className="mx-auto hidden h-auto max-w-full dark:block"
      />
    </figure>
  );
}
