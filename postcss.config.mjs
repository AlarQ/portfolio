/**
 * ADR-DS-2: Tailwind is wired in via the official v4 PostCSS plugin. Preflight
 * is disabled at the CSS-import level (see `src/app/globals.css` — only the
 * `theme` and `utilities` layers are imported, never `tailwindcss/preflight`),
 * so MUI's `CssBaseline` stays the sole base-element reset authority.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
