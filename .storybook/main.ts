import type { StorybookConfig } from "@storybook/nextjs";

/**
 * ADR-DS-1: `@storybook/nextjs` is the primary adapter (verified against the
 * installed Next 16 line via its published peer range). Stories live beside
 * components as `*.stories.tsx`, excluded from the SSG build (FR-10) because
 * Next only compiles files reachable from `src/app` routes.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["storybook/viewport"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
};

export default config;
