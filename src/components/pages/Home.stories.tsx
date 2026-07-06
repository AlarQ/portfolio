import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Post } from "@/data/posts";
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

/**
 * FR-8 / type-safety.md guardrail: the real `Post` interface (src/data/posts.ts)
 * requires `published`. A Post-shaped object that omits it must fail to
 * compile — proving the fixture can't silently drift from production shape.
 * Verified mechanically: temporarily delete the `@ts-expect-error` line below
 * and run `npm run type-check` — tsc errors on the missing `published` field.
 * Restore the comment once confirmed.
 */
// @ts-expect-error — Post requires `published`; omitting it must not compile.
const invalidPost: Post = {
  title: "Invalid Fixture (omits required published field)",
  dek: "This object is intentionally missing a required Post field.",
  date: "2026-01-01",
  readingTimeMinutes: 3,
  formattedDate: "January 1, 2026",
};
void invalidPost;
