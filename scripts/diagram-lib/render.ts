/**
 * The D2 render core - pure enough to be tested: source text in, SVG text and
 * gate failures out, no filesystem. `scripts/prerender-diagrams.ts` wraps it
 * with the reading and writing; `src/theme/diagrams.test.ts` wraps it with a
 * byte-comparison against the committed SVGs (the same freshness guarantee
 * `tokens.test.ts` gives generated `tokens.css`).
 *
 * Three gates live here, all of them cheap and all of them fatal (issue #122):
 * no colour literal in a source, a closed class vocabulary, and an aspect
 * budget. They collect rather than throw - see `renderScene`.
 */
import { D2 } from "@terrastruct/d2";
import { CLASS_VOCABULARY, prelude, type ThemeName } from "./theme.ts";

export const THEMES: ThemeName[] = ["light", "dark"];

/** Widest a scene may render before it stops being legible in the prose column. */
export const MAX_ASPECT_RATIO = 2;

const VOCABULARY = new Set<string>(CLASS_VOCABULARY);

// A colour literal is a hex triplet/quad or any CSS colour function; the named
// keywords are the ones an author would plausibly reach for by hand.
const HEX_LITERAL = /#[0-9a-fA-F]{3,8}\b/;
const COLOUR_FUNCTION = /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\s*\(/;
const COLOUR_KEYWORD =
  /\b(?:white|black|red|green|blue|yellow|orange|purple|violet|indigo|pink|gray|grey|silver|teal|cyan|magenta|brown|navy|olive|maroon|lime|aqua|fuchsia)\b/i;

/** `class: foo`, `class: [foo; bar]`, and the `*.class: foo` form. */
const CLASS_ASSIGNMENT = /(?:^|[\s.*])class\s*:\s*(\[[^\]]*\]|[A-Za-z0-9_-]+)/g;

/**
 * `#` opens a D2 comment only when followed by whitespace; a colour literal is
 * `#` glued to its digits. So this strips prose (including issue refs like
 * "# see #122") without ever hiding a hex.
 */
function stripComment(line: string): string {
  return line.replace(/(^|\s)#(\s.*)?$/, "$1");
}

/** Gate 1 - a source may not contain a colour. Reported per line, with the line. */
export function checkNoColourLiteral(scene: string, source: string): string[] {
  const failures: string[] = [];
  source.split("\n").forEach((line, index) => {
    const code = stripComment(line);
    const hit =
      code.match(HEX_LITERAL)?.[0] ??
      code.match(COLOUR_FUNCTION)?.[0] ??
      // A colour keyword only counts inside a style value - a label is free to
      // say "the green path".
      (/\b(?:fill|stroke|font-color)\s*:/.test(code) ? code.match(COLOUR_KEYWORD)?.[0] : undefined);
    if (hit !== undefined) {
      failures.push(
        `content/diagrams/${scene}.d2:${index + 1} - colour literal "${hit}"; use a class from the vocabulary (${CLASS_VOCABULARY.join(", ")})`
      );
    }
  });
  return failures;
}

/**
 * Gate 2 - every class named in a source is in the closed vocabulary. D2
 * silently ignores an unknown class, so a typo'd `class: termnal` would render
 * an unstyled box that still looks plausible; the set is only closed if it is
 * enforced.
 */
export function checkClassVocabulary(scene: string, source: string): string[] {
  const failures: string[] = [];
  source.split("\n").forEach((line, index) => {
    for (const match of stripComment(line).matchAll(CLASS_ASSIGNMENT)) {
      const raw = match[1];
      const names = raw.startsWith("[")
        ? raw
            .slice(1, -1)
            .split(";")
            .map((n) => n.trim())
            .filter(Boolean)
        : [raw];
      for (const name of names) {
        if (!VOCABULARY.has(name)) {
          failures.push(
            `content/diagrams/${scene}.d2:${index + 1} - unknown class "${name}"; the vocabulary is closed (${CLASS_VOCABULARY.join(", ")})`
          );
        }
      }
    }
  });
  return failures;
}

/** The intrinsic size the WASM build only records in the viewBox. */
function readViewBox(svg: string): { width: number; height: number } | undefined {
  const match = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  if (match === null) return undefined;
  return { width: Number(match[1]), height: Number(match[2]) };
}

/**
 * The WASM build emits an outer `<svg>` carrying a viewBox but NO width/height,
 * which collapses to zero height inside `<img class="h-auto">`. Stamp the
 * intrinsic size back on so the SVG is a valid standalone asset, not one that
 * only works inside this site's component.
 */
function withIntrinsicSize(svg: string, size: { width: number; height: number }): string {
  if (/<svg[^>]*\swidth="/.test(svg)) return svg;
  return svg.replace(/<svg /, `<svg width="${size.width}" height="${size.height}" `);
}

export interface Fonts {
  regular: Uint8Array;
  bold: Uint8Array;
}

export interface SceneResult {
  /** One SVG per theme; a theme is absent when it failed a gate or the compile. */
  svgs: Partial<Record<ThemeName, string>>;
  failures: string[];
}

/**
 * Render one scene in both themes. Failures COLLECT rather than throw: a
 * crashed `D2` instance is poisoned (every later call answers "Go program has
 * already exited"), so callers render each scene with its own instance - which
 * is exactly what this function does - and report every scene's real problem.
 *
 * `exemptFromAspect` is for the `_`-prefixed exemplar board only. A budget with
 * an exemption list is not a budget.
 */
export async function renderScene(
  scene: string,
  source: string,
  fonts: Fonts,
  options: { exemptFromAspect?: boolean } = {}
): Promise<SceneResult> {
  const failures = [...checkNoColourLiteral(scene, source), ...checkClassVocabulary(scene, source)];
  if (failures.length > 0) return { svgs: {}, failures };

  const d2 = new D2();
  const svgs: Partial<Record<ThemeName, string>> = {};
  for (const theme of THEMES) {
    try {
      const result = await d2.compile(prelude(theme) + source, {
        options: {
          layout: "elk",
          themeID: 0,
          pad: 24,
          sketch: false,
          fontRegular: fonts.regular,
          fontBold: fonts.bold,
        },
      });
      const svg = await d2.render(result.diagram, result.renderOptions);
      const size = readViewBox(svg);
      if (size === undefined) {
        failures.push(`${scene}-${theme}: rendered SVG has no viewBox`);
        continue;
      }
      const ratio = size.width / size.height;
      if (options.exemptFromAspect !== true && ratio > MAX_ASPECT_RATIO) {
        failures.push(
          `${scene}-${theme}: ${size.width}x${size.height} is ${ratio.toFixed(2)}:1, over the ${MAX_ASPECT_RATIO}:1 aspect budget - it will be illegible in the ~640px prose column. Flow the chain down: \`direction: down\` and the \`stepper\` modifier on every node.`
        );
        continue;
      }
      svgs[theme] = withIntrinsicSize(svg, size);
    } catch (error) {
      failures.push(`${scene}-${theme}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return { svgs, failures };
}
