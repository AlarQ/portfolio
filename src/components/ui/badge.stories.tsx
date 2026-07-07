import type { Meta, StoryObj } from "@storybook/nextjs";
import { Badge } from "./badge";
import { BADGE_CATEGORIES } from "./badgeVariants";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  args: { children: "Badge" },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  args: { variant: "default" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
    },
  },
};

export const Default: Story = { args: { variant: "default" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Link: Story = { args: { variant: "link" } };

export const CategoryViolet: Story = { args: { category: "violet", children: "violet" } };
export const CategoryIndigo: Story = { args: { category: "indigo", children: "indigo" } };
export const CategoryPink: Story = { args: { category: "pink", children: "pink" } };
export const CategorySky: Story = { args: { category: "sky", children: "sky" } };
export const CategoryGreen: Story = { args: { category: "green", children: "green" } };
export const CategoryGrayBlue: Story = {
  args: { category: "gray-blue", children: "gray-blue" },
};
export const CategoryOrange: Story = { args: { category: "orange", children: "orange" } };
export const CategoryRose: Story = { args: { category: "rose", children: "rose" } };

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
