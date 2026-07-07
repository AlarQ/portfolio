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
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PostCard>;

export const Default: Story = {
  args: {
    post: samplePost,
    coverImageUrl: samplePostCoverImageUrl,
    categories: samplePostCategories,
  },
};

export const WithoutImageOrCategories: Story = {
  args: {
    post: samplePost,
  },
};
