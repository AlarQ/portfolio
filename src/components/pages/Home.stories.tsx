import type { Meta, StoryObj } from "@storybook/nextjs";
import { samplePosts } from "@/stories/fixtures/posts";
import { mobileViewportParameters } from "@/stories/mobileViewport";
import { Home } from "./Home";

const meta: Meta<typeof Home> = {
  title: "Pages/Home",
  component: Home,
};

export default meta;
type Story = StoryObj<typeof Home>;

export const Default: Story = {
  args: {
    posts: samplePosts,
  },
};

/**
 * Figma "iPhone 15" mobile frame (390x844). Verifies the Home page's grid +
 * Newsletter + Footer stack reflows correctly at the smallest supported
 * breakpoint (see task 007 acceptance table, mobile reflow behavior).
 */
export const Mobile: Story = {
  args: {
    posts: samplePosts,
  },
  parameters: mobileViewportParameters,
};
