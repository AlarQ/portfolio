import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Project } from "@/data/projects";
import { ProjectSummary } from "./ProjectSummary";

const PROJECT: Project = {
  title: "Portfolio Site",
  slug: "portfolio-site",
  tagline: "A statically-generated portfolio and blog.",
  status: "in-progress",
  mvpProgress: 80,
  currentState: "Building the Projects tab on top of the existing seam-pattern architecture.",
  techStack: ["nextjs", "react", "typescript", "tailwind", "shadcn"],
  relatedPosts: [{ label: "Building the Projects tab", slug: "building-the-projects-tab" }],
};

const meta: Meta<typeof ProjectSummary> = {
  title: "Organisms/ProjectSummary",
  component: ProjectSummary,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectSummary>;

/** Full summary: title, tagline, Status, MVP meter, current state, tech badges, related posts. */
export const Default: Story = {
  args: { project: PROJECT },
};

/** Long title/tagline content — checks the summary doesn't clip or overflow. */
export const LongContent: Story = {
  args: {
    project: {
      ...PROJECT,
      title: "A Much Longer Project Title That Might Wrap Across Multiple Lines",
      tagline:
        "A tagline long enough to wrap across several lines to verify the summary layout stays legible and doesn't clip or overflow its container.",
    },
  },
};

/** `briefHref` present — the "Read full brief" link renders. */
export const WithBrief: Story = {
  args: { project: PROJECT, briefHref: "/projects/portfolio-site" },
};

/** `briefHref` omitted (FR-9: no Brief body yet) — no "Read full brief" link. */
export const WithoutBrief: Story = {
  args: { project: PROJECT },
};

/** `status: "exploring"` — the seam resolves a muted tone (exploring-muted-tone). */
export const Exploring: Story = {
  args: {
    project: {
      ...PROJECT,
      status: "exploring",
      mvpProgress: 15,
      currentState: "Still scoping the approach.",
    },
  },
};

/** Empty tech stack and no related posts — sections are omitted, not rendered blank. */
export const Minimal: Story = {
  args: {
    project: {
      ...PROJECT,
      techStack: [],
      relatedPosts: [],
    },
  },
};
