import type { Meta, StoryObj } from "@storybook/nextjs";
import { TabPill } from "./tab-pill";

const meta: Meta<typeof TabPill> = {
  title: "Atoms/TabPill",
  component: TabPill,
  args: { children: "Project" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TabPill>;

export const Unselected: Story = {
  args: { selected: false },
};

export const Selected: Story = {
  args: { selected: true },
};

export const SideBySide: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <TabPill selected>Selected</TabPill>
      <TabPill selected={false}>Unselected</TabPill>
    </div>
  ),
};
