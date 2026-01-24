import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#58a6ff" },
    secondary: { main: "#f78166" },
    background: {
      default: "#0d1117",
      paper: "#161b22",
    },
  },
  typography: {
    fontFamily: "var(--font-geist-sans)", // matches your CSS variable from layout.tsx
    // h1, h2, body1, etc. overrides here
  },
});
