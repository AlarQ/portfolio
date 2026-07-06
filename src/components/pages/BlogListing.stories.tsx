import type { Meta, StoryObj } from "@storybook/nextjs";
import { samplePosts } from "@/stories/fixtures/posts";
import { mobileViewportParameters } from "@/stories/mobileViewport";
import { BlogListing } from "./BlogListing";

const meta: Meta<typeof BlogListing> = {
  title: "Pages/BlogListing",
  component: BlogListing,
};

export default meta;
type Story = StoryObj<typeof BlogListing>;

export const Default: Story = {
  args: {
    posts: samplePosts,
  },
};

/** Figma "iPhone 15" mobile frame (390x844) — verifies the grid + Footer reflow. */
export const Mobile: Story = {
  args: {
    posts: samplePosts,
  },
  parameters: mobileViewportParameters,
};
