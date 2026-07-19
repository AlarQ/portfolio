import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import type { Project } from "@/data/projects";
import { ProjectTabStrip } from "./ProjectTabStrip";

function project(overrides: Partial<Project>): Project {
  return {
    title: "Project",
    slug: "project",
    tagline: "",
    status: "in-progress",
    mvpProgress: 50,
    currentState: "",
    repos: [],
    relatedPosts: [],
    ...overrides,
  };
}

const PROJECTS: readonly Project[] = [
  project({ title: "Portfolio Site", slug: "portfolio-site", status: "in-progress" }),
  project({ title: "Weekend Sketch", slug: "weekend-sketch", status: "exploring" }),
  project({ title: "Shipped Thing", slug: "shipped-thing", status: "shipped" }),
];

const LONG_PROJECTS: readonly Project[] = [
  ...PROJECTS,
  project({ title: "A Much Longer Project Title That Might Wrap", slug: "long-title" }),
  project({ title: "Another One", slug: "another-one" }),
  project({ title: "Yet Another Project", slug: "yet-another" }),
];

const meta: Meta<typeof ProjectTabStrip> = {
  title: "Organisms/ProjectTabStrip",
  component: ProjectTabStrip,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof ProjectTabStrip>;

/** Interactive: click a pill or use Arrow/Home/End keys to move selection. */
export const Interactive: Story = {
  render: () => {
    function Wrapper() {
      const [selectedSlug, setSelectedSlug] = useState(PROJECTS[0]?.slug ?? "");
      return (
        <ProjectTabStrip
          projects={PROJECTS}
          selectedSlug={selectedSlug}
          onSelectSlug={setSelectedSlug}
        />
      );
    }
    return <Wrapper />;
  },
};

/** Every Status tone represented, first pill (in-progress) selected by default. */
export const AllStatuses: Story = {
  args: {
    projects: PROJECTS,
    selectedSlug: PROJECTS[0]?.slug ?? "",
    onSelectSlug: () => {},
  },
};

/** Long titles / many pills - the strip stays a one-row scroll-snap rail. */
export const LongContent: Story = {
  args: {
    projects: LONG_PROJECTS,
    selectedSlug: LONG_PROJECTS[3]?.slug ?? "",
    onSelectSlug: () => {},
  },
};

/**
 * A non-exploring pill with low `mvpProgress` still resolves a muted dot
 * (FR-3: de-emphasis isn't limited to `status: "exploring"`).
 */
export const LowMvpProgress: Story = {
  args: {
    projects: [
      project({
        title: "Portfolio Site",
        slug: "portfolio-site",
        status: "in-progress",
        mvpProgress: 5,
      }),
      project({ title: "Weekend Sketch", slug: "weekend-sketch", status: "exploring" }),
      project({ title: "Shipped Thing", slug: "shipped-thing", status: "shipped" }),
    ],
    selectedSlug: "portfolio-site",
    onSelectSlug: () => {},
  },
};

/** No Projects - the tablist renders with zero tabs, no crash. */
export const Empty: Story = {
  args: {
    projects: [],
    selectedSlug: "",
    onSelectSlug: () => {},
  },
};
