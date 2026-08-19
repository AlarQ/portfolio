import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import type { Project } from "@/data/projects";
import { Projects } from "./Projects";

const PROJECTS: readonly Project[] = [
  {
    title: "Alpha",
    slug: "alpha",
    tagline: "The first project.",
    repos: [],
    relatedPosts: [],
    capabilities: [],
    roadmap: {
      milestoneName: "MVP",
      features: [{ name: "Ship it", status: "shipped", phase: "toward" }],
    },
  },
  {
    title: "Beta",
    slug: "beta",
    tagline: "The second project.",
    repos: [],
    relatedPosts: [],
    capabilities: [],
    roadmap: {
      milestoneName: "MVP",
      features: [{ name: "Ship it", status: "planned", phase: "toward" }],
    },
  },
];

describe("Projects page", () => {
  it("renders one card per Project, in array order (array-order-authoritative)", () => {
    const { container, unmount } = renderIntoDocument(<Projects projects={PROJECTS} />);

    const titles = Array.from(container.querySelectorAll("a")).map((el) => el.textContent);
    expect(titles).toEqual(["Alpha", "Beta"]);
    expect(container.textContent).toContain("The first project.");
    expect(container.textContent).toContain("The second project.");

    unmount();
  });

  it("links each card to its detail route", () => {
    const { container, unmount } = renderIntoDocument(<Projects projects={PROJECTS} />);

    const links = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(links).toContain("/projects/alpha");
    expect(links).toContain("/projects/beta");

    unmount();
  });

  it("renders the Milestone Progress figure and no meter/progressbar on the index", () => {
    const { container, unmount } = renderIntoDocument(<Projects projects={PROJECTS} />);

    expect(container.querySelector('[data-slot="milestone-figure"]')?.textContent).toBe(
      "MVP reached"
    );
    expect(container.querySelector('[role="progressbar"]')).toBeNull();
    expect(container.querySelector('[role="tablist"]')).toBeNull();

    unmount();
  });

  it("renders the FR-14 intro copy", () => {
    const { container, unmount } = renderIntoDocument(<Projects projects={PROJECTS} />);

    expect(container.textContent).toContain(
      "Projects I'm building right now - what each one lets you do, how far it is toward its next milestone, and how it's built. Open a project for the full brief."
    );

    unmount();
  });
});
