import type { Meta, StoryObj } from "@storybook/nextjs";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { mobileViewportParameters } from "@/stories/mobileViewport";
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

// Mobile (< md): inline nav collapses to brand + hamburger (Figma 618:705).
// Open the drawer from the story toolbar's rendered hamburger to review it.
export const NavbarMobile: Story = {
  args: { activeHref: "/blog" },
  parameters: mobileViewportParameters,
};

export const NavbarMobileDark: Story = {
  args: { activeHref: "/blog" },
  parameters: mobileViewportParameters,
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
