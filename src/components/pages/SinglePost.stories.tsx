import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  samplePost,
  samplePostCategories,
  samplePostCoverImageUrl,
} from "@/stories/fixtures/posts";
import { mobileViewportParameters } from "@/stories/mobileViewport";
import { SinglePost } from "./SinglePost";

const meta: Meta<typeof SinglePost> = {
  title: "Pages/SinglePost",
  component: SinglePost,
};

export default meta;
type Story = StoryObj<typeof SinglePost>;

/** Stand-in for a Post's real MDX body, shared across the theme/viewport matrix. */
const sampleBody = (
  <>
    <p>
      A tight token layer makes a design system easier to trust, not harder to use. This paragraph
      stands in for a Post&apos;s real MDX body content.
    </p>
    <h2>Composing over re-implementing</h2>
    <p>
      Every component in this pack composes primitives instead of re-implementing them. The prose
      wrapper carries Figma&apos;s 20px muted body typography so long-form reading matches the
      frame.
    </p>
    <figure>
      {/* biome-ignore lint/performance/noImgElement: stand-in for raw MDX body output, not an app-rendered image */}
      <img src={samplePostCoverImageUrl} alt="A representative inline article figure" />
      <figcaption>An inline captioned image, mirroring the Figma prose.</figcaption>
    </figure>
    <p>Sub-headings, paragraphs, and captioned figures all inherit the shared prose rhythm.</p>
  </>
);

const baseArgs = {
  post: samplePost,
  coverImageUrl: samplePostCoverImageUrl,
  coverImageAlt: "Hero image for the sample post",
  categories: samplePostCategories,
  children: sampleBody,
};

/** Desktop, light. */
export const Default: Story = {
  args: baseArgs,
};

/** Desktop, dark — per-story `theme` global drives the `withTheme` decorator. */
export const Dark: Story = {
  args: baseArgs,
  globals: { theme: "dark" },
};

/** Figma "iPhone 15" mobile frame (390x844), light. */
export const Mobile: Story = {
  args: baseArgs,
  parameters: mobileViewportParameters,
};

/** iPhone 15 mobile frame, dark. */
export const MobileDark: Story = {
  args: baseArgs,
  parameters: mobileViewportParameters,
  globals: { theme: "dark" },
};
