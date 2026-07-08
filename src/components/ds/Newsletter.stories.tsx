import type { Meta, StoryObj } from "@storybook/nextjs";
import { Newsletter } from "./Newsletter";

const meta: Meta<typeof Newsletter> = {
  title: "Molecules/Newsletter",
  component: Newsletter,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Newsletter>;

export const Default: Story = {
  args: {
    heading: "Stories and interviews",
    description:
      "Subscribe to learn about new product features, the latest in technology, solutions, and updates.",
    ctaLabel: "Subscribe",
  },
  render: (args) => (
    <div style={{ width: 560 }}>
      <Newsletter {...args} />
    </div>
  ),
};

export const WithHint: Story = {
  args: {
    heading: "Stories and interviews",
    description:
      "Subscribe to learn about new product features, the latest in technology, solutions, and updates.",
    ctaLabel: "Subscribe",
    hint: "We care about your data in our",
    privacyHref: "/privacy",
  },
  render: (args) => (
    <div style={{ width: 560 }}>
      <Newsletter {...args} />
    </div>
  ),
};
