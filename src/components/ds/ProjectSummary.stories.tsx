import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Project } from "@/data/projects";
import { ProjectSummary } from "./ProjectSummary";

const PROJECT: Project = {
  title: "Portfolio Site",
  slug: "portfolio-site",
  tagline: "A statically-generated portfolio and blog.",
  currentState: "Building the Projects tab on top of the existing seam-pattern architecture.",
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
};

const meta: Meta<typeof ProjectSummary> = {
  title: "Organisms/ProjectSummary",
  component: ProjectSummary,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectSummary>;

/** Full summary: title, tagline, current state, tech badges, related posts. */
export const Default: Story = {
  args: { project: PROJECT },
};

/** With an inline Brief body rendered under the summary. */
export const WithBrief: Story = {
  args: {
    project: PROJECT,
    brief: (
      <>
        <h2>Why this project exists</h2>
        <p>
          A fixture paragraph standing in for a real MDX Brief body, to check the inline layout
          without importing real `.mdx` content into a page-agnostic story.
        </p>
      </>
    ),
  },
};

/** No Brief body for this Project - the inline Brief section is omitted. */
export const NoBrief: Story = {
  args: { project: PROJECT },
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
  },
};

/** Empty repos and no related posts - sections are omitted, not rendered blank. */
export const Minimal: Story = {
  args: {
    project: {
      ...PROJECT,
      repos: [],
      relatedPosts: [],
    },
  },
};

/** Multi-repo Project - the role-label gutter (Frontend/Backend) renders. */
export const MultiRepo: Story = {
  args: {
    project: {
      ...PROJECT,
      repos: [
        {
          role: "frontend",
          techKeys: ["nextjs", "react", "typescript", "playwright"],
        },
        { role: "backend", techKeys: ["rust", "postgres"] },
      ],
    },
  },
};

/** Single-repo Project - no role-label gutter, plain badge row. */
export const SingleRepo: Story = {
  args: {
    project: {
      ...PROJECT,
      repos: [{ role: "backend", techKeys: ["rust"] }],
    },
  },
};

/** A repo with a long tech list - checks the badge row wraps instead of overflowing. */
export const LongStack: Story = {
  args: {
    project: {
      ...PROJECT,
      repos: [
        {
          role: "frontend",
          techKeys: [
            "nextjs",
            "react",
            "typescript",
            "tailwind",
            "shadcn",
            "biome",
            "playwright",
            "mdx",
          ],
        },
        { role: "backend", techKeys: ["rust", "axum", "postgres"] },
      ],
    },
  },
};
