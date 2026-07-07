import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";

const meta: Meta<typeof NavigationMenu> = {
  title: "Atoms/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

const menu = (
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Overview</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="#">Introduction</NavigationMenuLink>
        <NavigationMenuLink href="#">Getting started</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="#">Docs</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
);

export const Default: Story = {
  render: (args) => <NavigationMenu {...args}>{menu}</NavigationMenu>,
};

export const WithoutViewport: Story = {
  render: (args) => (
    <NavigationMenu {...args} viewport={false}>
      {menu}
    </NavigationMenu>
  ),
};

export const Playground: Story = {
  args: { viewport: true },
  render: (args) => <NavigationMenu {...args}>{menu}</NavigationMenu>,
};
