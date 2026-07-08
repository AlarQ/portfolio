import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  samplePost,
  samplePostCategories,
  samplePostCoverImageUrl,
} from "@/stories/fixtures/posts";
import { PostLayout } from "./PostLayout";

const meta: Meta<typeof PostLayout> = {
  title: "Organisms/PostLayout",
  component: PostLayout,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof PostLayout>;

const sampleBody = (
  <>
    <p>
      A tight token layer makes a design system easier to trust, not harder to use. This paragraph
      stands in for a Post&apos;s real MDX body content.
    </p>
    <h2>Composing over re-implementing</h2>
    <p>Every component in this pack composes primitives instead of re-implementing them.</p>
  </>
);

export const Default: Story = {
  args: {
    post: samplePost,
    coverImageUrl: samplePostCoverImageUrl,
    coverImageAlt: "Hero image for the sample post",
    categories: samplePostCategories,
    children: sampleBody,
  },
};

/** No cover image and no categories — exercises the gated null branches. */
export const WithoutHeroOrCategories: Story = {
  args: {
    post: samplePost,
    children: sampleBody,
  },
};
