import type { Meta, StoryObj } from "@storybook/nextjs";
import { AreaHeadlineCard } from "./AreaHeadlineCard";

const meta: Meta<typeof AreaHeadlineCard> = {
  title: "Molecules/AreaHeadlineCard",
  component: AreaHeadlineCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof AreaHeadlineCard>;

/** A Domain Area's name + offering headline. */
export const Default: Story = {
  args: {
    name: "Leadership",
    headline: "I lead full-stack engineering teams to predictable, end-to-end delivery.",
  },
};

/** Backend area - checks a second area reads consistently. */
export const Backend: Story = {
  args: {
    name: "Backend engineering",
    headline: "I build low-latency, high-throughput backend services and distributed systems.",
  },
};

/** Long name + headline - verifies the card wraps without clipping. */
export const LongContent: Story = {
  args: {
    name: "Distributed Systems & Platform Engineering Leadership",
    headline:
      "I lead teams building high-throughput, low-latency distributed backend systems, owning delivery end-to-end while growing engineers into people who no longer need me.",
  },
};
