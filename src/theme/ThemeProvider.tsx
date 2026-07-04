"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ADR-DS-2 implementation note (deviation from the ADR's literal
 * `injectFirst` wording): `injectFirst`'s insertion-point-`<meta>` mechanism
 * targets Pages Router's synchronous document head and is documented for
 * plain (non-Next) apps or Pages Router. This app already uses
 * `AppRouterCacheProvider` (`layout.tsx`) for App Router streaming SSR — the
 * `enableCssLayer` behavior it needs is enabled there via
 * `options={{ enableCssLayer: true }}`, which is what actually wraps every
 * emitted Emotion rule in `@layer mui {...}` (its overridden `cache.insert`).
 * A nested `StyledEngineProvider` here is unnecessary and, combined with
 * `AppRouterCacheProvider`'s own cache/registry, produced a server/client
 * emotion-cache hydration mismatch — so cascade-tie authority for MUI is
 * achieved entirely through the `AppRouterCacheProvider` option plus the
 * explicit `@layer theme, utilities, mui;` order declared in
 * `src/app/globals.css` (`mui` declared last wins ties), with no
 * `StyledEngineProvider` in this component.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
