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

/**
 * Non-exploring status with low `mvpProgress` — the seam still resolves a
 * muted tone (FR-3: de-emphasis isn't limited to `status: "exploring"`).
 */
export const LowMvpProgress: Story = {
  args: {
    project: {
      ...PROJECT,
      status: "in-progress",
      mvpProgress: 5,
      currentState: "Just started — too early to carry the in-progress tone.",
    },
  },
};

/** Empty repos and no related posts — sections are omitted, not rendered blank. */
export const Minimal: Story = {
  args: {
    project: {
      ...PROJECT,
      repos: [],
      relatedPosts: [],
    },
  },
};

/** Multi-repo Project — the role-label gutter (Frontend/Backend) renders. */
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

/** Single-repo Project — no role-label gutter, plain badge row. */
export const SingleRepo: Story = {
  args: {
    project: {
      ...PROJECT,
      repos: [{ role: "backend", techKeys: ["rust"] }],
    },
  },
};

/** A repo with a long tech list — checks the badge row wraps instead of overflowing. */
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
