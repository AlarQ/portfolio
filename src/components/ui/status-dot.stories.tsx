import type { Meta, StoryObj } from "@storybook/nextjs";
import { StatusDot } from "./status-dot";
import { STATUS_TONES } from "./statusDotVariants";

const meta: Meta<typeof StatusDot> = {
  title: "Atoms/StatusDot",
  component: StatusDot,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusDot>;

export const Playground: Story = {
  args: { tone: "muted" },
  argTypes: {
    tone: { control: "select", options: STATUS_TONES },
  },
};

export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {STATUS_TONES.map((tone) => (
        <div key={tone} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StatusDot tone={tone} />
          <span>{tone}</span>
        </div>
      ))}
    </div>
  ),
};
