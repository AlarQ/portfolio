import type { Meta, StoryObj } from "@storybook/nextjs";
import type { Project } from "@/data/projects";
import { Projects } from "./Projects";

const PROJECTS: readonly Project[] = [
  {
    title: "Portfolio Site",
    slug: "portfolio-site",
    tagline: "This site - a statically-generated portfolio and blog.",
    currentState: "Building the Projects tab.",
    repos: [{ role: "frontend", techKeys: ["nextjs", "react", "typescript"] }],
    relatedPosts: [],
  },
  {
    title: "Weekend Sketch",
    slug: "weekend-sketch",
    tagline: "An early-stage exploration.",
    currentState: "Sketching the idea.",
    repos: [{ role: "frontend", techKeys: ["react"] }],
    relatedPosts: [],
  },
  {
    title: "Shipped Thing",
    slug: "shipped-thing",
    tagline: "A completed project.",
    currentState: "Live and maintained.",
    repos: [{ role: "backend", techKeys: ["node"] }],
    relatedPosts: [],
  },
];

const meta: Meta<typeof Projects> = {
  title: "Pages/Projects",
  component: Projects,
  tags: ["autodocs"],
  args: { projects: PROJECTS, briefs: { "portfolio-site": <p>Fixture brief text.</p> } },
};

export default meta;
type Story = StoryObj<typeof Projects>;

/** First Project selected by default; click a pill to swap the summary. */
export const Default: Story = {};
