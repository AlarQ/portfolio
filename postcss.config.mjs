/**
 * ADR-DS-2: Tailwind is wired in via the official v4 PostCSS plugin.
 * Preflight is enabled via the umbrella `@import "tailwindcss"` in
 * `src/app/globals.css` — MUI is fully removed; there is no CssBaseline.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
