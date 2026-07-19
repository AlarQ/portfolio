import type { Meta, StoryObj } from "@storybook/nextjs";
import { PostEndCard } from "./PostEndCard";

const meta: Meta<typeof PostEndCard> = {
  title: "Molecules/PostEndCard",
  component: PostEndCard,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof PostEndCard>;

export const Default: Story = {
  args: {
    blogHref: "/blog",
    hnUrl: "https://news.ycombinator.com/item?id=1",
    newsletterHeading: "Get new posts by email",
  },
  render: (args) => (
    <div style={{ width: 640 }}>
      <PostEndCard {...args} />
    </div>
  ),
};

export const WithoutHackerNews: Story = {
  args: {
    blogHref: "/blog",
    newsletterHeading: "Get new posts by email",
  },
  render: (args) => (
    <div style={{ width: 640 }}>
      <PostEndCard {...args} />
    </div>
  ),
};

export const LongContent: Story = {
  args: {
    blogHref: "/blog",
    hnUrl: "https://news.ycombinator.com/item?id=1",
    heading: "Thanks for reading this rather long post about a niche topic",
    body: "If you found this useful, more deep dives on this same subject are already in the works - stick around, subscribe, or come say hi in the discussion thread.",
    newsletterHeading: "Get new posts by email",
  },
  render: (args) => (
    <div style={{ width: 640 }}>
      <PostEndCard {...args} />
    </div>
  ),
};
