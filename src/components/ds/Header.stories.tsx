import type { Meta, StoryObj } from "@storybook/nextjs";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { Header } from "./Header";

// Dark and mobile are toolbar concerns, not separate stories: flip the Theme
// toolbar for dark, and the Viewport toolbar (iphone15, 390x844) for the mobile
// layout where the inline nav collapses to brand + hamburger (Figma 618:705).
const meta: Meta<typeof Header> = {
  title: "Organisms/Header",
  component: Header,
  parameters: { layout: "fullscreen" },
  args: { items: sampleNavItems },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Navbar: Story = {
  args: { activeHref: "/blog" },
};

export const Masthead: Story = {
  args: { title: "THE BLOG" },
};

// Long-content: whitespace-nowrap + clamp means an over-long title clips
// within the bordered band (overflow-hidden) instead of breaking page layout.
export const LongTitle: Story = {
  args: { title: "THE ENGINEERING BLOG" },
};

// Empty: the degenerate navbar with no nav items.
export const EmptyNav: Story = {
  args: { items: [] },
};
