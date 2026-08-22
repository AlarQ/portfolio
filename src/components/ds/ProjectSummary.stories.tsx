import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Project } from "@/data/projects";
import { ProjectSummary } from "./ProjectSummary";

const PROJECT: Project = {
  title: "Portfolio Site",
  slug: "portfolio-site",
  tagline: "A statically-generated portfolio and blog.",
  repos: [
    {
      role: "frontend",
      techKeys: ["nextjs", "react", "typescript", "tailwind", "shadcn"],
    },
  ],
  relatedPosts: [
    { label: "Building the Projects tab", slug: "building-the-projects-tab" },
    { label: "Designing the seam pattern", slug: "designing-the-seam-pattern" },
    { label: "Why Storybook-first", slug: "why-storybook-first" },
  ],
  capabilities: [],
  roadmap: {
    milestoneName: "MVP",
    features: [{ name: "Ship the seam pattern", status: "shipped", phase: "toward" }],
  },
};

const meta: Meta<typeof ProjectSummary> = {
  title: "Organisms/ProjectSummary",
  component: ProjectSummary,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectSummary>;

/** Full summary: title, tagline, meter row, tech badges, related posts. */
export const Default: Story = {
  args: { project: PROJECT, percent: 50, legend: "50% to MVP" },
};

/** No Milestone Progress yet. */
export const ZeroPercent: Story = {
  args: { project: PROJECT, percent: 0, legend: "0% to MVP" },
};

/** Milestone reached - the meter still renders the same, no special state. */
export const FullyShipped: Story = {
  args: { project: PROJECT, percent: 100, legend: "100% to MVP" },
};

/** No related Posts - the "From the blog" section is omitted. */
export const NoRelatedPosts: Story = {
  args: { project: { ...PROJECT, relatedPosts: [] }, percent: 50, legend: "50% to MVP" },
};

/** Long title/tagline content - checks the summary doesn't clip or overflow. */
export const LongContent: Story = {
  args: {
    project: {
      ...PROJECT,
      title: "A Much Longer Project Title That Might Wrap Across Multiple Lines",
      tagline:
        "A tagline long enough to wrap across several lines to verify the summary layout stays legible and doesn't clip or overflow its container.",
    },
    percent: 50,
    legend: "50% to MVP",
  },
};

/** Empty repos and no related posts - sections are omitted, not rendered blank. */
export const Minimal: Story = {
  args: {
    project: { ...PROJECT, repos: [], relatedPosts: [] },
    percent: 50,
    legend: "50% to MVP",
  },
};

/** Multi-repo Project - the role-label gutter (Frontend/Backend) renders. */
export const MultiRepo: Story = {
  args: {
    project: {
      ...PROJECT,
      repos: [
        { role: "frontend", techKeys: ["nextjs", "react", "typescript", "playwright"] },
        { role: "backend", techKeys: ["rust", "postgres"] },
      ],
    },
    percent: 50,
    legend: "50% to MVP",
  },
};
