import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  bondsmithFixture,
  hyperionFixture,
  manyBeyondFixture,
} from "@/components/storybook-fixtures/projects";
import { deriveMilestoneProgress } from "@/data/roadmap";
import { RoadmapSection } from "./RoadmapSection";

const meta: Meta<typeof RoadmapSection> = {
  title: "Organisms/RoadmapSection",
  component: RoadmapSection,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof RoadmapSection>;

/** Bondsmith's 8-Feature Roadmap: 3 of 6 `toward` shipped, 2 `beyond`. */
export const BondsmithInProgress: Story = {
  args: { progress: deriveMilestoneProgress(bondsmithFixture.roadmap) },
};

/** Hyperion at 100% - every `toward` Feature shipped, `beyond` still open. */
export const HyperionComplete: Story = {
  args: { progress: deriveMilestoneProgress(hyperionFixture.roadmap) },
};

/** A Roadmap with many `beyond` Features relative to `toward`. */
export const ManyBeyond: Story = {
  args: { progress: deriveMilestoneProgress(manyBeyondFixture.roadmap) },
};

/** No `toward` Features shipped yet - 0%. */
export const JustStarted: Story = {
  args: {
    progress: deriveMilestoneProgress({
      milestoneName: "MVP",
      features: [
        { name: "First feature", status: "planned", phase: "toward" },
        { name: "Second feature", status: "planned", phase: "toward" },
      ],
    }),
  },
};
