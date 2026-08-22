import type { Meta, StoryObj } from "@storybook/nextjs";
import type { ProjectRepo } from "@/data/projects";
import { RepoTechRows } from "./RepoTechRows";

const SINGLE_REPO: readonly ProjectRepo[] = [
  { role: "backend", techKeys: ["rust", "tokio", "axum", "postgres"] },
];

const MULTI_REPO: readonly ProjectRepo[] = [
  { role: "frontend", techKeys: ["nextjs", "react", "typescript", "playwright"] },
  { role: "backend", techKeys: ["rust", "postgres"] },
];

const meta: Meta<typeof RepoTechRows> = {
  title: "Molecules/RepoTechRows",
  component: RepoTechRows,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof RepoTechRows>;

/** Single Repo - no role-label gutter, plain badge row. */
export const SingleRepo: Story = {
  args: { repos: SINGLE_REPO },
};

/** Multiple Repos - the role-label gutter (Frontend/Backend) renders. */
export const MultiRepo: Story = {
  args: { repos: MULTI_REPO },
};

/** A long tech list - checks the badge row wraps instead of overflowing. */
export const LongStack: Story = {
  args: {
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
};

/** No Repos - renders nothing. */
export const Empty: Story = {
  args: { repos: [] },
};
