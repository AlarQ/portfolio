import type { Meta, StoryObj } from "@storybook/nextjs";
import { userEvent, within } from "storybook/test";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { HeaderMobileMenu } from "./HeaderMobileMenu";

const meta: Meta<typeof HeaderMobileMenu> = {
  title: "Organisms/Header/MobileMenu",
  component: HeaderMobileMenu,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "iphone15" },
  },
  args: { items: sampleNavItems, activeHref: "/blog" },
};

export default meta;
type Story = StoryObj<typeof HeaderMobileMenu>;

// Closed: just the hamburger trigger (drawer lives in a body portal on open).
export const Closed: Story = {};

// Open: the play fn clicks the hamburger so the slide-in drawer + scrim render.
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));
  },
};

export const OpenDark: Story = {
  globals: { theme: "dark" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));
  },
};

// Empty items: the drawer opens with no links, just the theme pill.
export const EmptyItems: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));
  },
};
