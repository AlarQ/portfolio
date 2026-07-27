// Diagram colour gate for the native-Excalidraw diagram pipeline (see
// `scripts/prerender-diagrams.ts`). A `.excalidraw` scene is authored in the
// LIGHT palette only; the dark SVG is derived at render time by
// `scripts/diagram-lib/theme.ts` via an exhaustive hex→hex swap. This module
// owns that swap table and the "is this hex legal" gate - the runtime
// equivalent of the old builder's compile-time `Record<Role, Hue>`
// exhaustiveness. Every hex here is resolved from `primitives` in
// `src/theme/tokens.ts` by primitive name - never a pasted hex literal.

import { primitives } from "../../src/theme/tokens.ts";

export type ThemeName = "light" | "dark";
export type Usage = "fill" | "stroke" | "text";

const TRANSPARENT = "transparent";

// --- fill: backgroundColor on any element -----------------------------
const FILL_TO_DARK: Record<string, string> = {
  [primitives.categoryVioletBg]: primitives.cardDark,
  [primitives.categoryOrangeBg]: primitives.cardDark,
  [primitives.categoryGreenBg]: primitives.cardDark,
  [primitives.categoryIndigoBg]: primitives.cardDark,
  [primitives.categoryGrayBlueBg]: primitives.cardDark,
  [primitives.gray50]: primitives.backgroundDark,
  [primitives.white]: primitives.backgroundDark,
};

// --- stroke: strokeColor on non-text elements (rect/arrow/line/etc.) --
const STROKE_TO_DARK: Record<string, string> = {
  [primitives.categoryVioletFg]: primitives.shikiTokenFunction,
  [primitives.categoryOrangeFg]: primitives.shikiTokenConstant,
  [primitives.categoryGreenFg]: primitives.shikiTokenString,
  [primitives.categoryIndigoFg]: primitives.shikiTokenKeyword,
  [primitives.categoryGrayBlueFg]: primitives.shikiTokenKeyword,
  [primitives.gray200]: primitives.borderDark,
  [primitives.gray700]: primitives.bodyDark,
};

// --- text: strokeColor on `type: "text"` elements ----------------------
const TEXT_TO_DARK: Record<string, string> = {
  [primitives.categoryVioletFg]: primitives.bodyDark,
  [primitives.categoryOrangeFg]: primitives.bodyDark,
  [primitives.categoryGreenFg]: primitives.bodyDark,
  [primitives.categoryIndigoFg]: primitives.bodyDark,
  [primitives.categoryGrayBlueFg]: primitives.bodyDark,
  [primitives.bodyLight]: primitives.bodyDark,
  [primitives.gray700]: primitives.bodyDark,
};

/** The three hex→hex swap maps, keyed by usage bucket. */
export const TO_DARK: {
  fill: Record<string, string>;
  stroke: Record<string, string>;
  text: Record<string, string>;
} = {
  fill: FILL_TO_DARK,
  stroke: STROKE_TO_DARK,
  text: TEXT_TO_DARK,
};

/**
 * Resolve a light-palette hex to its dark-theme equivalent for one usage
 * bucket. `"transparent"` passes through unchanged in every bucket (the
 * light scenes use it for text/arrow backgrounds). Any other hex not in the
 * bucket's map is an off-palette colour and throws - this is the runtime
 * exhaustiveness gate that replaces the old compile-time `Record<Role, Hue>`.
 */
export function darkenHex(hex: string, usage: Usage): string {
  if (hex === TRANSPARENT) return TRANSPARENT;
  const map = TO_DARK[usage];
  const dark = map[hex];
  if (dark === undefined) {
    const legal = Object.keys(map).join(", ");
    throw new Error(
      `off-palette ${usage} "${hex}" - legal ${usage} hexes: ${legal} (see docs/plans/diagram-native-excalidraw-migration.md / the excalidraw-diagram skill)`
    );
  }
  return dark;
}
