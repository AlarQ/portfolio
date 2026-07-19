import type { Meta, StoryObj } from "@storybook/nextjs";
import { mobileViewportParameters } from "@/stories/mobileViewport";
import { IdentityRail } from "./IdentityRail";

const PORTRAIT = { src: "/images/profile.jpg", alt: "Ernest Bednarczyk" };

const meta: Meta<typeof IdentityRail> = {
  title: "Organisms/IdentityRail",
  component: IdentityRail,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    portrait: PORTRAIT,
    name: "Ernest Bednarczyk",
    title: "SOFTWARE ENGINEER",
    subtitle: "TEAM LEADER",
  },
};

export default meta;
type Story = StoryObj<typeof IdentityRail>;

export const Default: Story = {};

/** Long name/title - checks the identity text wraps without clipping. */
export const LongName: Story = {
  args: {
    name: "Ernest Aleksander Bednarczyk-Kowalski",
    title: "SENIOR STAFF SOFTWARE ENGINEER",
    subtitle: "ENGINEERING TEAM LEADER",
  },
};

/** Figma "iPhone 15" mobile frame (390x844) - the rail before it goes sticky. */
export const Mobile: Story = {
  parameters: mobileViewportParameters,
};
