import type { Meta, StoryObj } from "@storybook/nextjs";
import { samplePost } from "@/stories/fixtures/posts";
import { mobileViewportParameters } from "@/stories/mobileViewport";
import { SinglePost } from "./SinglePost";

const meta: Meta<typeof SinglePost> = {
  title: "Pages/SinglePost",
  component: SinglePost,
};

export default meta;
type Story = StoryObj<typeof SinglePost>;

/** Stand-in for a Post's real MDX body, shared by the Default and Mobile variants. */
const sampleBody = (
  <>
    <p>
      A tight token layer makes a design system easier to trust, not harder to use. This paragraph
      stands in for a Post&apos;s real MDX body content.
    </p>
    <p>Every component in this pack composes primitives instead of re-implementing them.</p>
  </>
);

export const Default: Story = {
  args: {
    post: samplePost,
    children: sampleBody,
  },
};

/** Figma "iPhone 15" mobile frame (390x844) — verifies the post layout reflow. */
export const Mobile: Story = {
  args: {
    post: samplePost,
    children: sampleBody,
  },
  parameters: mobileViewportParameters,
};
