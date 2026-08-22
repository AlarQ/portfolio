import type { Meta, StoryObj } from "@storybook/nextjs";
import { Meter } from "./meter";

const meta: Meta<typeof Meter> = {
  title: "Atoms/Meter",
  component: Meter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Meter>;

export const Playground: Story = {
  args: { value: 50, legend: "50% to MVP" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
  },
};

export const Empty: Story = {
  args: { value: 0, legend: "0% to MVP" },
};

export const Mid: Story = {
  args: { value: 50, legend: "50% to MVP" },
};

export const Full: Story = {
  args: { value: 100, legend: "100% to Maturity" },
};
