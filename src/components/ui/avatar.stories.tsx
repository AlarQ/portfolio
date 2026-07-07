import type { Meta, StoryObj } from "@storybook/nextjs";
import { CheckIcon } from "lucide-react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./avatar";

const AVATAR_SIZES = ["sm", "default", "lg"] as const;

const meta: Meta<typeof Avatar> = {
  title: "Atoms/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://i.pravatar.cc/64" alt="User" />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {
  args: { size: "default" },
  argTypes: { size: { control: "select", options: AVATAR_SIZES } },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {AVATAR_SIZES.map((size) => (
        <Avatar key={size} size={size}>
          <AvatarImage src="https://i.pravatar.cc/64" alt="User" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};

export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/64" alt="User" />
      <AvatarFallback>AB</AvatarFallback>
      <AvatarBadge>
        <CheckIcon />
      </AvatarBadge>
    </Avatar>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>CD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>EF</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
};
