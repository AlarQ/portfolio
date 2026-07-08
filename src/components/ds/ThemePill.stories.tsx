import type { Meta, StoryObj } from "@storybook/nextjs";
import { ThemePill } from "./ThemePill";

const meta: Meta<typeof ThemePill> = {
  title: "Molecules/ThemePill",
  component: ThemePill,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof ThemePill>;

// Flip the Theme toolbar (Light/Dark) to verify the knob moves to the moon
// (light) vs the sun (dark) and the pill/icon colors invert.
export const Default: Story = {};
