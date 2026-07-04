import type { Preview } from "@storybook/nextjs";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import "../src/app/globals.css";

/**
 * Global Storybook decorator surface. Every story renders inside the app's
 * real `ThemeProvider` (`src/theme/ThemeProvider.tsx`) — the same MUI theme +
 * CssBaseline the live routes use — so tasks 004-008 (which add
 * components/stories) get real theme context for free without re-deciding
 * the adapter/provider question (this chunk's `storybook_theme_provider_
 * scaffold_present_for_downstream_reuse` behavior).
 */
const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
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
