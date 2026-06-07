import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#0ea5e9" },
    secondary: { main: "#f97316" },
    background: {
      default: "#0a1118",
      paper: "#141b22",
    },
  },
  typography: {
    fontFamily: "var(--font-geist-sans)",
  },
});
