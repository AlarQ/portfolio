import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "./button";

const BUTTON_VARIANTS = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
] as const;
const BUTTON_TEXT_SIZES = ["xs", "sm", "default", "lg"] as const;
const BUTTON_ICON_SIZES = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  args: { children: "Button" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  args: { variant: "default", size: "default" },
  argTypes: {
    variant: { control: "select", options: BUTTON_VARIANTS },
    size: { control: "select", options: [...BUTTON_TEXT_SIZES, ...BUTTON_ICON_SIZES] },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {BUTTON_VARIANTS.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {BUTTON_TEXT_SIZES.map((size) => (
        <Button key={`text-${size}`} size={size}>
          {size}
        </Button>
      ))}
      {BUTTON_ICON_SIZES.map((size) => (
        <Button key={`icon-${size}`} size={size}>
          ☆
        </Button>
      ))}
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };
