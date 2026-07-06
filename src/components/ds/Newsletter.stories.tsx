import type { Meta, StoryObj } from "@storybook/nextjs";
import { Newsletter } from "./Newsletter";

const meta: Meta<typeof Newsletter> = {
  title: "Molecules/Newsletter",
  component: Newsletter,
};

export default meta;
type Story = StoryObj<typeof Newsletter>;

export const Default: Story = {
  args: {
    heading: "Get new posts in your inbox",
    description: "One email whenever a new post ships. No spam.",
    ctaLabel: "Subscribe",
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <Newsletter {...args} />
    </div>
  ),
};
