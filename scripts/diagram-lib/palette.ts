// Diagram presentation seam for the Excalidraw-based diagram pipeline (see
// `scripts/prerender-diagrams.ts`). Ports the role/theme palette tables that
// used to live in `scripts/prerender-mermaid.ts` verbatim: a diagram builder
// spec (`content/diagrams/<name>.diagram.ts`) tags each shape with a semantic
// ROLE, never a colour, and this module resolves role → colour per theme from
// `src/theme/tokens.ts` primitives - the ONE colour source. A role with no
// palette entry is a compile error (`Record<Role, Hue>` is exhaustive).

import { primitives } from "../../src/theme/tokens.ts";

export type Role =
  | "plan"
  | "build"
  | "verify"
  | "ship"
  | "gate"
  | "agent"
  | "audit"
  | "sink"
  | "loop";
export type ThemeName = "light" | "dark";
export interface Swatch {
  stroke: string;
  fill: string;
  text: string;
}

type PName = keyof typeof primitives;
// [fill, stroke, text] - same shape/order as prerender-mermaid.ts's `Hue`.
type Hue = [fill: PName, stroke: PName, text: PName];

// Light = category Badge tints; dark node fill = the elevated dark card,
// strokes = the Shiki token palette (same as code blocks) - identical to the
// Mermaid palette this replaces.
const lightViolet: Hue = ["categoryVioletBg", "categoryVioletFg", "categoryVioletFg"];
const lightOrange: Hue = ["categoryOrangeBg", "categoryOrangeFg", "categoryOrangeFg"];
const lightGreen: Hue = ["categoryGreenBg", "categoryGreenFg", "categoryGreenFg"];
const lightIndigo: Hue = ["categoryIndigoBg", "categoryIndigoFg", "categoryIndigoFg"];
const lightGrayBlue: Hue = ["categoryGrayBlueBg", "categoryGrayBlueFg", "categoryGrayBlueFg"];
const LIGHT_ROLES: Record<Role, Hue> = {
  plan: lightIndigo,
  build: lightGreen,
  verify: lightViolet,
  ship: lightOrange,
  gate: lightGrayBlue,
  agent: lightViolet,
  audit: lightOrange,
  sink: lightGreen,
  loop: lightViolet,
};
const darkViolet: Hue = ["cardDark", "shikiTokenFunction", "bodyDark"];
const darkOrange: Hue = ["cardDark", "shikiTokenConstant", "bodyDark"];
const darkGreen: Hue = ["cardDark", "shikiTokenString", "bodyDark"];
const darkIndigo: Hue = ["cardDark", "shikiTokenKeyword", "bodyDark"];
const darkGrayBlue: Hue = ["cardDark", "shikiTokenKeyword", "bodyDark"];
const DARK_ROLES: Record<Role, Hue> = {
  plan: darkIndigo,
  build: darkGreen,
  verify: darkViolet,
  ship: darkOrange,
  gate: darkGrayBlue,
  agent: darkViolet,
  audit: darkOrange,
  sink: darkGreen,
  loop: darkViolet,
};

// Subgraph container hue + frame edge/background primitive names, one entry
// per theme - the same shape as prerender-mermaid.ts's `THEMES` table.
interface Theme {
  roles: Record<Role, Hue>;
  container: Hue;
  line: PName;
  bg: PName;
}
const THEMES: Record<ThemeName, Theme> = {
  light: {
    roles: LIGHT_ROLES,
    container: ["gray50", "gray200", "bodyLight"],
    line: "gray700",
    bg: "white",
  },
  dark: {
    roles: DARK_ROLES,
    container: ["backgroundDark", "borderDark", "bodyDark"],
    line: "bodyDark",
    bg: "backgroundDark",
  },
};

function swatchOf([fill, stroke, text]: Hue): Swatch {
  return { fill: primitives[fill], stroke: primitives[stroke], text: primitives[text] };
}

/** Resolve a shape's role → its stroke/fill/text hex for one theme. */
export function roleSwatch(role: Role, theme: ThemeName): Swatch {
  return swatchOf(THEMES[theme].roles[role]);
}

/** Resolve the subgraph/container frame hue for one theme. */
export function containerSwatch(theme: ThemeName): Swatch {
  return swatchOf(THEMES[theme].container);
}

/** Resolve the scene-level line/background primitives for one theme. */
export function frameColors(theme: ThemeName): { line: string; bg: string } {
  const t = THEMES[theme];
  return { line: primitives[t.line], bg: primitives[t.bg] };
}
