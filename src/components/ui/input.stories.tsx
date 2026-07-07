import type { Meta, StoryObj } from "@storybook/nextjs";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  args: { placeholder: "Type here…" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Playground: Story = {
  args: { type: "text" },
  argTypes: {
    type: { control: "select", options: ["text", "email", "password", "number"] },
  },
};

export const Default: Story = {};
export const WithValue: Story = { args: { defaultValue: "Hello world" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "Disabled" } };
export const Invalid: Story = { args: { "aria-invalid": true, defaultValue: "Invalid input" } };
export const Password: Story = { args: { type: "password", defaultValue: "secret" } };
