import type { Meta, StoryObj } from "@storybook/nextjs";
import { Conclusion } from "./Conclusion";

const meta: Meta<typeof Conclusion> = {
  title: "Molecules/Conclusion",
  component: Conclusion,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Conclusion>;

export const Default: Story = {
  args: {
    heading: "Ready to build your own?",
    body: "Start with a small, honest token layer and let it grow with the design.",
    ctaLabel: "Read the next post",
    ctaHref: "/blog/the-seam-pattern",
  },
};
