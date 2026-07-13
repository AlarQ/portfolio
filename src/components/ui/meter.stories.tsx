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
  args: { value: 50 },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
  },
};

export const Empty: Story = {
  args: { value: 0 },
};

export const Mid: Story = {
  args: { value: 50 },
};

export const Full: Story = {
  args: { value: 100 },
};
