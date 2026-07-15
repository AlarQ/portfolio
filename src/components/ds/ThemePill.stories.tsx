import type { Meta, StoryObj } from "@storybook/nextjs";
import { ThemePill } from "./ThemePill";

const meta: Meta<typeof ThemePill> = {
  title: "Molecules/ThemePill",
  component: ThemePill,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ThemePill>;

/** Light-active: the moon sits in the filled knob, sun is bare. */
export const Light: Story = {
  globals: { theme: "light" },
};

/** Dark-active: per-story `theme` global drives the `withTheme` decorator
 * (see `.storybook/preview.tsx`) — the sun sits in the filled knob, moon is bare. */
export const Dark: Story = {
  globals: { theme: "dark" },
};
