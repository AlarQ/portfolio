import type { Meta, StoryObj } from "@storybook/nextjs";
import { samplePost, samplePostCoverImageUrl } from "@/stories/fixtures/posts";
import { ArticleProse } from "./ArticleProse";

const meta: Meta<typeof ArticleProse> = {
  title: "Organisms/ArticleProse",
  component: ArticleProse,
};

export default meta;
type Story = StoryObj<typeof ArticleProse>;

const sampleBody = (
  <>
    <p>
      A tight token layer makes a design system easier to trust, not harder to use. This paragraph
      stands in for a Post&apos;s real MDX body content.
    </p>
    <h2>Composing over re-implementing</h2>
    <p>Every component in this pack composes primitives instead of re-implementing them.</p>
    <figure>
      {/* biome-ignore lint/performance/noImgElement: stand-in for raw MDX body output, not an app-rendered image */}
      <img src={samplePostCoverImageUrl} alt="A representative inline article figure" />
      <figcaption>An inline captioned image, mirroring the Figma prose.</figcaption>
    </figure>
  </>
);

export const Default: Story = {
  args: {
    post: samplePost,
    children: sampleBody,
  },
};

export const WithHero: Story = {
  args: {
    post: samplePost,
    coverImageUrl: samplePostCoverImageUrl,
    coverImageAlt: "Hero image for the sample post",
    children: sampleBody,
  },
};
