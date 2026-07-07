import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta: Meta<typeof Card> = {
  title: "Atoms/Card",
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} style={{ width: 320 }}>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>Card body content.</CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: (args) => (
    <Card {...args} style={{ width: 320 }}>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>Card body content.</CardContent>
      <CardFooter>
        <Button size="sm">Confirm</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <Card {...args} style={{ width: 320 }}>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
        <CardAction>
          <Button size="icon-sm" variant="ghost">
            ⋯
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>Card body content.</CardContent>
    </Card>
  ),
};

export const Playground: Story = {
  args: {},
  render: (args) => (
    <Card {...args} style={{ width: 320 }}>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>Card body content.</CardContent>
      <CardFooter>
        <Button size="sm">Confirm</Button>
      </CardFooter>
    </Card>
  ),
};
