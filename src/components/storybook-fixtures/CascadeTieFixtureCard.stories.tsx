import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { CascadeTieFixtureCard } from "./CascadeTieFixtureCard";

/**
 * Wraps the fixture in the same provider stack the live app uses
 * (`src/app/layout.tsx`) — `AppRouterCacheProvider options={{ enableCssLayer:
 * true }}` is what actually wraps emitted Emotion rules in `@layer mui`, so
 * the cascade-tie behavior asserted in `e2e/cascade-tie.spec.ts` matches
 * production, not a Storybook-only approximation.
 */
const meta: Meta<typeof CascadeTieFixtureCard> = {
  title: "Atoms/CascadeTieFixtureCard",
  component: CascadeTieFixtureCard,
  decorators: [
    (Story) => (
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </AppRouterCacheProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CascadeTieFixtureCard>;

export const Default: Story = {};
