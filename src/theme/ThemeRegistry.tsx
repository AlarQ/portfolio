// Client Component - required because we use React hooks (useServerInsertedHTML)
// Without 'use client', Next.js treats this as a Server Component and hooks fail
"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import { useServerInsertedHTML } from "next/navigation";

// Singleton cache instance - created once at module load, shared across renders
// key: 'mui' prefixes all generated class names (e.g., mui-1a2b3c)
const cache = createCache({ key: "mui" });

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";

const theme = createTheme(); // default MUI theme for now

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  // This hook runs during SSR streaming - each time a chunk of HTML is about to be sent
  // It extracts accumulated styles from the cache and injects them as <style> tags
  useServerInsertedHTML(() => {
    // cache.inserted is an object: { styleName: 'cssString', ... }
    // Get all style names that have been generated since last flush
    const names = Object.keys(cache.inserted);
    if (names.length === 0) {
      return null; // No new styles to inject
    }

    // Collect all CSS strings into one
    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }

    // Clear inserted so we don't send duplicates
    cache.inserted = {};

    // Return <style> tag to be injected into <head>
    // data-emotion attribute helps Emotion identify its styles for hydration
    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Emotion-generated CSS is safe
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  // Provider nesting order matters - each wraps deeper ones, making context available below
  // CacheProvider → ThemeProvider → CssBaseline → children
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
