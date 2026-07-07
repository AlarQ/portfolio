import type { Meta, StoryObj } from "@storybook/nextjs";
import { Badge } from "./badge";
import { BADGE_CATEGORIES } from "./badgeVariants";

const BADGE_VARIANTS = ["default", "secondary", "destructive", "outline", "ghost", "link"] as const;

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  args: { children: "Badge" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  args: { variant: "default" },
  argTypes: {
    variant: { control: "select", options: BADGE_VARIANTS },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {BADGE_VARIANTS.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const AllCategories: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {BADGE_CATEGORIES.map((category) => (
        <Badge key={category} category={category}>
          {category}
        </Badge>
      ))}
    </div>
  ),
};
