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
    heading: "Get new posts by email",
    description: "Tired of hot takes? Stick around for more thoughtful posts on tech and beyond.",
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
    heading: "Get new posts by email",
    description: "Tired of hot takes? Stick around for more thoughtful posts on tech and beyond.",
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

/** Wired with a direct-POST `action` (local fixture URL) - page-agnostic. */
export const Wired: Story = {
  args: {
    heading: "Get new posts by email",
    description: "Tired of hot takes? Stick around for more thoughtful posts on tech and beyond.",
    ctaLabel: "Subscribe",
    hint: "We care about your data in our",
    privacyHref: "/privacy",
    action: "https://example.com/embed-subscribe/fixture",
  },
  render: (args) => (
    <div style={{ width: 560 }}>
      <Newsletter {...args} />
    </div>
  ),
};
