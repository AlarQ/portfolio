"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ThemeProvider as NextThemesProvider } from "next-themes";
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
 *
 * FR-9 (Task 008): `NextThemesProvider` is mounted OUTSIDE `MuiThemeProvider`,
 * fully decoupled from it — it only toggles the `class` attribute on `<html>`
 * (`attribute="class"`) to flip between the semantic-token `:root`/`.dark`
 * blocks in `tokens.css`. It never touches MUI's `theme` object or
 * `CssBaseline`, mirroring the Tailwind/MUI coexistence pattern in
 * `coexistence.test.ts` — two independent styling systems sharing one page,
 * neither aware of the other. Default is light (`defaultTheme="light"`,
 * `enableSystem={false}` so a visitor's OS preference never silently
 * overrides the authored default).
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </NextThemesProvider>
  );
}
