import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Project } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";

const PROJECT: Project = {
  title: "Bondsmith",
  slug: "bondsmith",
  tagline:
    "A spec-driven development workflow engine in Rust - phase contracts enforced in typed code, not by an LLM.",
  repos: [{ role: "backend", techKeys: ["rust"] }],
  relatedPosts: [],
  capabilities: [],
  roadmap: { milestoneName: "MVP", features: [] },
};

const meta: Meta<typeof ProjectCard> = {
  title: "Organisms/ProjectCard",
  component: ProjectCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

/** A Project partway toward its Milestone. */
export const InProgress: Story = {
  args: { project: PROJECT, figure: "50% to MVP", href: "/projects/bondsmith" },
};

/** A Project just getting started. */
export const JustStarted: Story = {
  args: { project: PROJECT, figure: "0% to MVP", href: "/projects/bondsmith" },
};

/** A Project that reached its Milestone - a state word, not "100% to …". */
export const MilestoneReached: Story = {
  args: {
    project: { ...PROJECT, title: "Hyperion", slug: "hyperion" },
    figure: "Maturity reached",
    href: "/projects/hyperion",
  },
};

/** Long title/tagline content - checks the card doesn't clip or overflow. */
export const LongContent: Story = {
  args: {
    project: {
      ...PROJECT,
      title: "A Much Longer Project Title That Might Wrap Across Multiple Lines",
      tagline:
        "A tagline long enough to wrap across several lines to verify the card layout stays legible and doesn't clip or overflow its container.",
    },
    figure: "50% to MVP",
    href: "/projects/bondsmith",
  },
};

/** Short tagline. */
export const ShortTagline: Story = {
  args: {
    project: { ...PROJECT, tagline: "A tiny tagline." },
    figure: "50% to MVP",
    href: "/projects/bondsmith",
  },
};

/** Multiple Repos - the role-label gutter renders. */
export const MultiRepo: Story = {
  args: {
    project: {
      ...PROJECT,
      repos: [
        { role: "frontend", techKeys: ["nextjs", "react"] },
        { role: "backend", techKeys: ["rust", "postgres"] },
      ],
    },
    figure: "50% to MVP",
    href: "/projects/bondsmith",
  },
};
