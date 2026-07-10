import type { Meta, StoryObj } from "@storybook/nextjs";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { samplePosts } from "@/stories/fixtures/posts";
import { mobileViewportParameters } from "@/stories/mobileViewport";
import { Author } from "./Author";

const meta: Meta<typeof Author> = {
  title: "Pages/Author",
  component: Author,
  args: {
    posts: samplePosts,
    navItems: sampleNavItems,
    activeHref: "/author",
  },
};

export default meta;
type Story = StoryObj<typeof Author>;

export const Default: Story = {};

/** Figma "iPhone 15" mobile frame (390x844) — verifies the profile + grid reflow. */
export const Mobile: Story = {
  parameters: mobileViewportParameters,
};
