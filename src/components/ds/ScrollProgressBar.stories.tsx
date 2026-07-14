import type { Meta, StoryObj } from "@storybook/nextjs";
import { ScrollProgressBar } from "./ScrollProgressBar";

const meta: Meta<typeof ScrollProgressBar> = {
  title: "Molecules/ScrollProgressBar",
  component: ScrollProgressBar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ScrollProgressBar>;

export const Start: Story = {
  args: { progress: 0 },
};

export const Halfway: Story = {
  args: { progress: 0.5 },
};

export const Complete: Story = {
  args: { progress: 1 },
};

export const ReducedMotion: Story = {
  args: { progress: 0.5, reducedMotion: true },
};
