import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { CascadeTieFixtureCard } from "./CascadeTieFixtureCard";

/**
 * `ThemeProvider` is already applied globally by `.storybook/preview.tsx`'s
 * decorator — this story only adds the `AppRouterCacheProvider
 * options={{ enableCssLayer: true }}` wrapper on top, since that's what
 * actually wraps emitted Emotion rules in `@layer mui` (matching
 * `src/app/layout.tsx`), so the cascade-tie behavior asserted in
 * `e2e/cascade-tie.spec.ts` matches production, not a Storybook-only
 * approximation.
 */
const meta: Meta<typeof CascadeTieFixtureCard> = {
  title: "Internal/CascadeTieFixtureCard",
  component: CascadeTieFixtureCard,
  decorators: [
    (Story) => (
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <Story />
      </AppRouterCacheProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CascadeTieFixtureCard>;

export const Default: Story = {};
