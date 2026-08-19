import type { Meta, StoryObj } from "@storybook/nextjs";
import { posterSrc } from "@/components/storybook-fixtures/projects";
import { MediaFrame } from "./MediaFrame";

const meta: Meta<typeof MediaFrame> = {
  title: "Atoms/MediaFrame",
  component: MediaFrame,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof MediaFrame>;

/** A still Capability's frame - bordered, clipped, `object-contain`. */
export const Default: Story = {
  args: {
    src: posterSrc,
    alt: "A diagram of the flow chain.",
  },
};

/** First-row priority loading (LCP-eligible). */
export const Priority: Story = {
  args: {
    src: posterSrc,
    alt: "A diagram of the flow chain.",
    priority: true,
  },
};
