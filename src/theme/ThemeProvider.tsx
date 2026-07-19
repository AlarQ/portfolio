"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * FR-7 (Task 006): the MUI half (`MuiThemeProvider`, `CssBaseline`,
 * `AppRouterCacheProvider`) is fully unmounted - the app is now next-themes
 * only. `NextThemesProvider` toggles the `class` attribute on `<html>`
 * (`attribute="class"`) to flip between the semantic-token `:root`/`.dark`
 * blocks in `tokens.css`. Default is light (`defaultTheme="light"`,
 * `enableSystem={false}` so a visitor's OS preference never silently
 * overrides the authored default) - FR-9's original acceptance, preserved
 * unchanged by this task.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
