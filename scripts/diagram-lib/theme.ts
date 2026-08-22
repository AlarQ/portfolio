/**
 * The D2 diagram theme - the one place a diagram's colour comes from.
 *
 * A `content/diagrams/*.d2` source carries STRUCTURE + a semantic class per
 * shape and never a colour (the render script rejects a colour literal in a
 * source outright). The look lives here, as a `classes:` prelude concatenated
 * in front of every source at render time, resolved from `src/theme/tokens.ts`
 * primitives BY NAME - a renamed primitive is a compile error, the same
 * guarantee `tokens.css` generation buys the site surface (ADR-0005).
 *
 * The class vocabulary is CLOSED and shared by every scene: `node`, `emphasis`,
 * `terminal`, `group`, the composable `planned` and `stepper` modifiers, and
 * the two edge classes. D2 silently ignores an unknown class, so the render
 * script gates every `class:` value against `CLASS_VOCABULARY` - the set is
 * only closed if it is enforced.
 *
 * Dark deliberately collapses the tinted fills to `cardDark` and carries the
 * hue in the stroke: tinted dark fills would mean inventing primitives in
 * `tokens.ts` with exactly one consumer.
 */
import { primitives as p } from "../../src/theme/tokens.ts";

export type ThemeName = "light" | "dark";

/**
 * Every class an author may name in a `.d2`. Roles are exclusive; `planned` and
 * `stepper` are modifiers composed onto a role - `class: [node; planned]`, role
 * first (D2 resolves last-in-list-wins, so a modifier has to come after).
 */
export const CLASS_VOCABULARY = [
  "node",
  "emphasis",
  "terminal",
  "group",
  "planned",
  "stepper",
  "edge",
  "edge-feedback",
] as const;

export type DiagramClass = (typeof CLASS_VOCABULARY)[number];

/**
 * The pinned node width for a chain scene (issue #121). Chains flow DOWN as a
 * vertical stepper; this width fills the ~640px prose column at the scale the
 * SVG lands at. It lives here, applied once per scene as `*.class: stepper`,
 * rather than copy-pasted as a magic number across six sources.
 */
const STEPPER_WIDTH = 560;

interface Palette {
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  nodeBg: string;
  nodeFg: string;
  emphasisBg: string;
  emphasisFg: string;
  terminalBg: string;
  terminalFg: string;
  plannedBg: string;
  plannedFg: string;
}

const LIGHT: Palette = {
  bg: p.white,
  surface: p.gray50,
  border: p.gray200,
  text: p.gray700,
  muted: p.bodyLight,
  nodeBg: p.categoryGrayBlueBg,
  nodeFg: p.categoryGrayBlueFg,
  emphasisBg: p.categoryIndigoBg,
  emphasisFg: p.categoryIndigoFg,
  terminalBg: p.categoryGreenBg,
  terminalFg: p.categoryGreenFg,
  plannedBg: p.categoryVioletBg,
  plannedFg: p.categoryVioletFg,
};

// Dark: fills collapse to the card surface, hue survives in the stroke.
const DARK: Palette = {
  bg: p.backgroundDark,
  surface: p.cardDark,
  border: p.borderDark,
  text: p.bodyDark,
  muted: p.bodyDark,
  // The default box is deliberately the quiet one - a neutral stroke, so the
  // single `emphasis` node is the only saturated shape on a dark page.
  nodeBg: p.cardDark,
  nodeFg: p.bodyDark,
  emphasisBg: p.cardDark,
  emphasisFg: p.shikiTokenKeyword,
  terminalBg: p.cardDark,
  terminalFg: p.shikiTokenString,
  plannedBg: p.cardDark,
  plannedFg: p.shikiTokenFunction,
};

const PALETTES: Record<ThemeName, Palette> = { light: LIGHT, dark: DARK };

const box = (fill: string, stroke: string, fontColor: string) =>
  `{ style: { fill: "${fill}"; stroke: "${stroke}"; stroke-width: 1; border-radius: 8; font-color: "${fontColor}" } }`;

/**
 * The prelude for one theme: D2 config (layout engine, padding, and the theme
 * slots D2 paints itself) plus the closed class vocabulary.
 */
export function prelude(theme: ThemeName): string {
  const c = PALETTES[theme];
  return `vars: {
  d2-config: {
    layout-engine: elk
    pad: 24
    sketch: false
    theme-overrides: { N1: "${c.text}"; N2: "${c.text}"; N7: "${c.bg}"; B1: "${c.text}"; B2: "${c.text}" }
  }
}
classes: {
  node: ${box(c.nodeBg, c.nodeFg, c.text)}
  emphasis: ${box(c.emphasisBg, c.emphasisFg, c.text)}
  terminal: ${box(c.terminalBg, c.terminalFg, c.text)}
  group: { style: { fill: "${c.surface}"; stroke: "${c.border}"; stroke-width: 1; border-radius: 8; font-color: "${c.muted}" } }
  planned: { style: { fill: "${c.plannedBg}"; stroke: "${c.plannedFg}"; stroke-dash: 4 } }
  stepper: { width: ${STEPPER_WIDTH} }
  edge: { style: { stroke: "${c.muted}"; stroke-width: 1; font-color: "${c.muted}"; font-size: 13 } }
  edge-feedback: { style: { stroke: "${c.muted}"; stroke-width: 1; stroke-dash: 4; font-color: "${c.muted}"; font-size: 13 } }
}
`;
}
