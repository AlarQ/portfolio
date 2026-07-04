import type { Preview } from "@storybook/nextjs";
import "../src/app/globals.css";

/**
 * Global Storybook decorator surface. Kept intentionally empty of MUI/theme
 * wiring this chunk — the coexistence tooling (FR-1/ADR-DS-2) lands via
 * ThemeProvider + globals.css import above; component-level theme providers
 * are added per-story as Pages/Organisms stories arrive in later chunks.
 */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
