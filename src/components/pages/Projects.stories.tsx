import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Project } from "@/data/projects";
import { Projects } from "./Projects";

const PROJECTS: readonly Project[] = [
  {
    title: "Portfolio Site",
    slug: "portfolio-site",
    tagline: "This site - a statically-generated portfolio and blog.",
    status: "in-progress",
    mvpProgress: 80,
    currentState: "Building the Projects tab.",
    repos: [{ role: "frontend", techKeys: ["nextjs", "react", "typescript"] }],
    relatedPosts: [],
  },
  {
    title: "Weekend Sketch",
    slug: "weekend-sketch",
    tagline: "An early-stage exploration.",
    status: "exploring",
    mvpProgress: 15,
    currentState: "Sketching the idea.",
    repos: [{ role: "frontend", techKeys: ["react"] }],
    relatedPosts: [],
  },
  {
    title: "Shipped Thing",
    slug: "shipped-thing",
    tagline: "A completed project.",
    status: "shipped",
    mvpProgress: 100,
    currentState: "Live and maintained.",
    repos: [{ role: "backend", techKeys: ["node"] }],
    relatedPosts: [],
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

/** First Project selected by default; click a pill to swap the summary. */
export const Default: Story = {};
