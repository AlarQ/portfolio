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

// Masthead + tagline: the `subtitle` line beneath the display title, as used
// by the blog index ("cold take" / "slow thoughts on fast tech").
export const MastheadWithSubtitle: Story = {
  args: { title: "cold take", subtitle: "slow thoughts on fast tech" },
};

// Mobile masthead: the whole point of the cqi fit-to-band sizing. At the
// narrowest supported width (320px - where the old `vw` sizing clipped
// "THE BLO…"), the container-query headline must scale down to fill the
// padded band without clipping. A story-local 320px viewport exercises the
// tight case the shared iphone15 (390px) frame only nearly hit.
export const MastheadMobile: Story = {
  args: { title: "THE BLOG" },

  parameters: {
    viewport: {
      viewports: {
        narrow: {
          name: "Narrow (320px)",
          styles: { width: "320px", height: "844px" },
          type: "mobile",
        },
      },
    },
  },

  globals: {
    viewport: {
      value: "narrow",
      isRotated: false,
    },
  },
};

// Long-content: the compact one-liner band wraps via flex-wrap rather than
// clipping, so an over-long title flows onto a second line without breaking
// page layout.
export const LongTitle: Story = {
  args: { title: "THE ENGINEERING BLOG" },
};

// Empty: the degenerate navbar with no nav items.
export const EmptyNav: Story = {
  args: { items: [] },
};
