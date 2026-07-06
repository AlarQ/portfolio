import type { Meta, StoryObj } from "@storybook/nextjs";
import { samplePost } from "@/stories/fixtures/posts";
import { PostLayout } from "./PostLayout";

const meta: Meta<typeof PostLayout> = {
  title: "Organisms/PostLayout",
  component: PostLayout,
};

export default meta;
type Story = StoryObj<typeof PostLayout>;

export const Default: Story = {
  args: {
    post: samplePost,
    children: (
      <>
        <p>
          A tight token layer makes a design system easier to trust, not harder to use. This
          paragraph stands in for a Post&apos;s real MDX body content.
        </p>
        <p>Every component in this pack composes primitives instead of re-implementing them.</p>
      </>
    ),
  },
};
