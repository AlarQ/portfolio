import type { Meta, StoryObj } from "@storybook/nextjs";
import { samplePosts } from "@/stories/fixtures/posts";
import { PrevNextNav } from "./PrevNextNav";

/**
 * Neighbours drawn from the canonical `samplePosts` set (page-agnostic — the
 * story never resolves adjacency itself, it just slices the fixture). `prev`
 * is the newer neighbour, `next` the older one.
 */
const [newer, , older] = samplePosts;

const meta: Meta<typeof PrevNextNav> = {
  title: "Molecules/PrevNextNav",
  component: PrevNextNav,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PrevNextNav>;

/** Middle Post: both neighbours present. */
export const Middle: Story = {
  args: { prev: newer, next: older },
};

/** Newest edge: no newer neighbour — only the Older link renders. */
export const NewestEdge: Story = {
  args: { next: older },
};

/** Oldest edge: no older neighbour — only the Newer link renders. */
export const OldestEdge: Story = {
  args: { prev: newer },
};
