import { createTheme } from "@mui/material/styles";

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
  white: "#ffffff",
  backgroundDefault: "#0a1118",
  backgroundPaper: "#141b22",
} as const;

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
