import { createTheme } from "@mui/material/styles";

/**
 * Compose an `rgba()` string from a 6-digit hex token and an alpha in [0, 1].
 * Overlay/scrim/border tokens derive from base hues through this helper so a
 * hue change propagates instead of silently drifting against a hand-typed rgba.
 */
export function withAlpha(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const backgroundPaper = "#141b22";
const black = "#000000";
const white = "#ffffff";

/**
 * The single brand color seam. Every named hue lives here once; presentation
 * seams (`skillPresentation`, `readingPresentation`) and domain data import
 * these tokens instead of re-typing raw hex. Change a brand color in one place.
 */
export const brand = {
  sky: "#0ea5e9",
  skyLight: "#38bdf8",
  skyLighter: "#7dd3fc",
  skyDark: "#0284c7",
  skyGlow: "rgba(14, 165, 233, 0.4)",
  skyTint: "rgba(14, 165, 233, 0.1)",
  lime: "#84cc16",
  limeDark: "#5f9610",
  orange: "#f97316",
  orangeDark: "#c55a0d",
  violet: "#a855f7",
  slate: "#64748b",
  slateLight: "#e2e8f0",
  white,
  black,
  backgroundDefault: "#0a1118",
  backgroundPaper,
  // Overlay / elevation tokens — derived from base hues, never re-typed by hand.
  paperOverlay85: withAlpha(backgroundPaper, 0.85),
  paperOverlay95: withAlpha(backgroundPaper, 0.95),
  scrim: withAlpha(black, 0.5),
  borderSubtle: withAlpha(white, 0.12),
} as const;

/**
 * The `--shiki-*` CSS-var bridge — the *second surface* of the brand seam
 * (ADR-0001). Shiki emits static, build-time HTML that cannot read the MUI
 * runtime theme, so code-block colors flow through CSS custom properties whose
 * values are sourced **only** from `brand` tokens here. `globals.css` mirrors
 * this map verbatim; `shikiVars.test.ts` asserts the two stay equal, so a
 * `brand` change that fails to reach the CSS var fails CI instead of silently
 * splitting the syntax-highlighting palette. Every value MUST be a `brand`
 * token — no raw hex lives in this map or in the `globals.css` mirror.
 *
 * Foreground/background pairs are chosen for WCAG-AA contrast against
 * `backgroundPaper`: `slateLight` (#e2e8f0) on `backgroundPaper` (#141b22).
 */
export const shikiVars = {
  "--shiki-bg": brand.backgroundPaper,
  "--shiki-fg": brand.slateLight,
  "--shiki-token-comment": brand.slate,
  "--shiki-token-keyword": brand.skyLight,
  "--shiki-token-string": brand.lime,
  "--shiki-token-constant": brand.orange,
  "--shiki-token-function": brand.violet,
  "--shiki-token-variable": brand.skyLighter,
} as const satisfies Record<string, string>;

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: brand.sky },
    secondary: { main: brand.orange },
    background: {
      default: brand.backgroundDefault,
      paper: brand.backgroundPaper,
    },
  },
  typography: {
    fontFamily: "var(--font-geist-sans)",
  },
});
