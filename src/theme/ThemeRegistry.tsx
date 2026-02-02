"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import { useServerInsertedHTML } from "next/navigation";

const cache = createCache({ key: "mui" });

import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";
export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => {
    const names = Object.keys(cache.inserted);
    if (names.length === 0) {
      return null;
    }

    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }

    cache.inserted = {};

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
