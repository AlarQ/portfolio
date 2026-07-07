import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  samplePost,
  samplePostCategories,
  samplePostCoverImageUrl,
} from "@/stories/fixtures/posts";
import { PostCard } from "./PostCard";

const meta: Meta<typeof PostCard> = {
  title: "Molecules/PostCard",
  component: PostCard,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof PostCard>;

export const Default: Story = {
  args: {
    post: samplePost,
    coverImageUrl: samplePostCoverImageUrl,
    categories: samplePostCategories,
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <PostCard {...args} />
    </div>
  ),
};

export const WithoutImageOrCategories: Story = {
  args: {
    post: samplePost,
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <PostCard {...args} />
    </div>
  ),
};
