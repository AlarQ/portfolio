import { act } from "react";
import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import type { Project } from "@/data/projects";
import { Projects } from "./Projects";

const PROJECTS: readonly Project[] = [
  {
    title: "Alpha",
    slug: "alpha",
    tagline: "The first project.",
    status: "in-progress",
    mvpProgress: 50,
    currentState: "",
    techStack: [],
    relatedPosts: [],
  },
  {
    title: "Beta",
    slug: "beta",
    tagline: "The second project.",
    status: "exploring",
    mvpProgress: 10,
    currentState: "",
    techStack: [],
    relatedPosts: [],
  },
];

describe("Projects page", () => {
  it("shows the first Project's summary on initial render with no interaction", () => {
    const { container, unmount } = renderIntoDocument(<Projects projects={PROJECTS} />);

    expect(container.textContent).toContain("Alpha");
    expect(container.textContent).toContain("The first project.");
    expect(container.textContent).not.toContain("The second project.");

    unmount();
  });

  it("clicking a different pill swaps the summary client-side, with no navigation", () => {
    const { container, unmount } = renderIntoDocument(<Projects projects={PROJECTS} />);

    const betaTab = [...container.querySelectorAll('[role="tab"]')].find((el) =>
      el.textContent?.includes("Beta")
    ) as HTMLElement;
    expect(betaTab).toBeTruthy();

    act(() => {
      betaTab.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("The second project.");
    expect(container.textContent).not.toContain("The first project.");

    unmount();
  });

  it("wraps the summary swap in a motion-safe-only transition (instant under prefers-reduced-motion)", () => {
    const { container, unmount } = renderIntoDocument(<Projects projects={PROJECTS} />);

    const wrapper = container.querySelector('[data-testid="project-summary-swap"]');
    expect(wrapper).not.toBeNull();
    const classes = wrapper?.className.split(/\s+/) ?? [];
    expect(classes).toContain("motion-safe:transition-opacity");
    expect(classes).toContain("motion-safe:duration-200");
    expect(classes).not.toContain("transition-opacity");

    unmount();
  });
});
