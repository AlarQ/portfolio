import type { Meta, StoryObj } from "@storybook/nextjs";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { samplePosts } from "@/stories/fixtures/posts";
import { mobileViewportParameters } from "@/stories/mobileViewport";
import { Home } from "./Home";

const meta: Meta<typeof Home> = {
  title: "Pages/Home",
  component: Home,
  args: {
    posts: samplePosts,
    navItems: sampleNavItems,
    activeHref: "/blog",
  },
};

export default meta;
type Story = StoryObj<typeof Home>;

export const Default: Story = {};

/**
 * Figma "iPhone 15" mobile frame (390x844). Verifies the blog index — masthead,
 * "Recent blog posts" featured cluster, "All blog posts" grid, and Footer —
 * reflows to a single column at the smallest supported breakpoint. `Pagination`
 * does not render here: it's caller-suppressed whenever `totalPages <= 1`
 * (no `?page=` routing exists yet, OQ-6 — see
 * `specs/route-migration/tasks/005-invert-ia-home-index-with-blog-redirect.md`).
 */
export const Mobile: Story = {
  parameters: mobileViewportParameters,
};
