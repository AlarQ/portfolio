import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#0ea5e9" }, // Sky blue
    secondary: { main: "#f97316" }, // Orange
    background: {
      default: "#0a1118",
      paper: "#141b22",
    },
  },
  typography: {
    fontFamily: "var(--font-geist-sans)", // matches your CSS variable from layout.tsx
    // h1, h2, body1, etc. overrides here
  },
});

// Custom colors for service cards
export const serviceCardColors = {
  orange: "#f97316", // Orange
  limeGreen: "#84cc16", // Lime green
};
