import type { Meta, StoryObj } from "@storybook/nextjs";
import { AdsSpace } from "./AdsSpace";

const meta: Meta<typeof AdsSpace> = {
  title: "Molecules/AdsSpace",
  component: AdsSpace,
};

export default meta;
type Story = StoryObj<typeof AdsSpace>;

export const Default: Story = {};
