import type { Meta, StoryObj } from "@storybook/nextjs";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { Header } from "./Header";

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

export const MastheadDark: Story = {
  args: { title: "THE BLOG" },
  globals: { theme: "dark" },
};

export const NavbarDark: Story = {
  args: { activeHref: "/blog" },
  globals: { theme: "dark" },
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
