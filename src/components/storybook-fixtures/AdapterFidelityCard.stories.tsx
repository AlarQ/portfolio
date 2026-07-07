import type { Meta, StoryObj } from "@storybook/nextjs";
import { AdapterFidelityCard } from "./AdapterFidelityCard";

const meta: Meta<typeof AdapterFidelityCard> = {
  title: "Internal/AdapterFidelityCard",
  component: AdapterFidelityCard,
};

export default meta;
type Story = StoryObj<typeof AdapterFidelityCard>;

export const Default: Story = {};
