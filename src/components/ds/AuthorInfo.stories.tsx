import type { Meta, StoryObj } from "@storybook/nextjs";
import { AuthorInfo } from "./AuthorInfo";

const meta: Meta<typeof AuthorInfo> = {
  title: "Molecules/AuthorInfo",
  component: AuthorInfo,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof AuthorInfo>;

export const Default: Story = {
  args: {
    name: "Ernest Bednarczyk",
    title: "Software Engineer",
    fallback: "EB",
  },
};
