import type { Meta, StoryObj } from "@storybook/nextjs";
import { bondsmithFixture, hyperionFixture } from "@/components/storybook-fixtures/projects";
import { ProjectDetail } from "./ProjectDetail";

const meta: Meta<typeof ProjectDetail> = {
  title: "Pages/ProjectDetail",
  component: ProjectDetail,
};

export default meta;
type Story = StoryObj<typeof ProjectDetail>;

/** Stand-in for a Project's real Brief MDX body. */
const sampleBrief = (
  <>
    <p>
      This paragraph stands in for a Project&apos;s real Brief MDX body content, rendered below the
      Roadmap section.
    </p>
    <h2>Why this shape</h2>
    <p>The Brief carries the long-form story; the sections above carry the at-a-glance facts.</p>
  </>
);

/** Bondsmith: capabilities (clip + still + text-only rows) and an 8-Feature Roadmap. */
export const Bondsmith: Story = {
  args: { project: bondsmithFixture, children: sampleBrief },
};

/** Hyperion: stills-only Capabilities, Roadmap at 100%. */
export const Hyperion: Story = {
  args: { project: hyperionFixture, children: sampleBrief },
};
