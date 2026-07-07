import type { Meta, StoryObj } from "@storybook/nextjs";
import { samplePosts } from "@/stories/fixtures/posts";
import { mobileViewportParameters } from "@/stories/mobileViewport";
import { Author } from "./Author";

const meta: Meta<typeof Author> = {
  title: "Pages/Author",
  component: Author,
};

export default meta;
type Story = StoryObj<typeof Author>;

export const Default: Story = {
  args: {
    posts: samplePosts,
  },
};

/** Figma "iPhone 15" mobile frame (390x844) — verifies the profile + grid reflow. */
export const Mobile: Story = {
  args: {
    posts: samplePosts,
  },
  parameters: mobileViewportParameters,
};
