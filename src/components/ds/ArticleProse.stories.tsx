import type { Meta, StoryObj } from "@storybook/nextjs";
import { Callout } from "@/components/Callout";
import { samplePost, samplePostCoverImageUrl } from "@/stories/fixtures/posts";
import { ListItem, UnorderedList } from "@/utils/mdxPresentationBlock";
import { Anchor } from "@/utils/mdxPresentationText";
import { ArticleProse } from "./ArticleProse";

const meta: Meta<typeof ArticleProse> = {
  title: "Organisms/ArticleProse",
  component: ArticleProse,
};

export default meta;
type Story = StoryObj<typeof ArticleProse>;

/**
 * A body fixture exercising the whole rewritten MDX seam so the story shows every
 * element - paragraphs, a heading, a list, a blockquote, a Callout, and an
 * external link - resolving its colors/spacing from semantic tokens in both
 * themes. The list/link/Callout render through the real seam components (as the
 * App Router `useMDXComponents` hook maps them); it stays router-free so 004's
 * SinglePost story can reuse it.
 */
const sampleBody = (
  <>
    <p>
      A tight token layer makes a design system easier to trust, not harder to use. This paragraph
      stands in for a Post&apos;s real MDX body content.
    </p>
    <h2>Composing over re-implementing</h2>
    <p>Every component in this pack composes primitives instead of re-implementing them:</p>
    <UnorderedList>
      <ListItem>Bind only the semantic token layer, never a raw hex.</ListItem>
      <ListItem>Let the compiler catch an unbacked alias.</ListItem>
      <ListItem>Keep every visual treatment at the single seam.</ListItem>
    </UnorderedList>
    <blockquote>
      <p>Constraints are the point: a smaller palette is a more trustworthy one.</p>
    </blockquote>
    <Callout title="Human gate">
      Prefer a semantic alias over a primitive - see the{" "}
      <Anchor href="https://example.com/token-guide">token guide</Anchor> for the rationale.
    </Callout>
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
