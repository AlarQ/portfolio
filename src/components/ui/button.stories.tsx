import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "Button" },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  args: { variant: "default", size: "default" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
  },
};

export const Default: Story = { args: { variant: "default" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Link: Story = { args: { variant: "link" } };

export const SizeDefault: Story = { args: { size: "default" } };
export const SizeXs: Story = { args: { size: "xs" } };
export const SizeSm: Story = { args: { size: "sm" } };
export const SizeLg: Story = { args: { size: "lg" } };
export const SizeIcon: Story = { args: { size: "icon", children: "☆" } };

export const Disabled: Story = { args: { disabled: true } };
