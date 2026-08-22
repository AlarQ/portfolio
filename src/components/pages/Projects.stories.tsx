import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Project } from "@/data/projects";
import { Projects } from "./Projects";

const PROJECTS: readonly Project[] = [
  {
    title: "Portfolio Site",
    slug: "portfolio-site",
    tagline: "This site - a statically-generated portfolio and blog.",
    repos: [{ role: "frontend", techKeys: ["nextjs", "react", "typescript"] }],
    relatedPosts: [],
    capabilities: [],
    roadmap: {
      milestoneName: "MVP",
      features: [
        { name: "Ship it", status: "shipped", phase: "toward" },
        { name: "Polish it", status: "in-progress", phase: "toward" },
      ],
    },
  },
  {
    title: "Weekend Sketch",
    slug: "weekend-sketch",
    tagline: "An early-stage exploration.",
    repos: [{ role: "frontend", techKeys: ["react"] }],
    relatedPosts: [],
    capabilities: [],
    roadmap: {
      milestoneName: "MVP",
      features: [{ name: "Ship it", status: "planned", phase: "toward" }],
    },
  },
  {
    title: "Shipped Thing",
    slug: "shipped-thing",
    tagline: "A completed project.",
    repos: [{ role: "backend", techKeys: ["node"] }],
    relatedPosts: [],
    capabilities: [],
    roadmap: {
      milestoneName: "MVP",
      features: [{ name: "Ship it", status: "shipped", phase: "toward" }],
    },
  },
];

const meta: Meta<typeof Projects> = {
  title: "Pages/Projects",
  component: Projects,
  tags: ["autodocs"],
  args: { projects: PROJECTS },
};

export default meta;
type Story = StoryObj<typeof Projects>;

/** Cards in authored array order: 0%, in-progress, and 100% figures. */
export const Default: Story = {};
