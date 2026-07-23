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
    currentState: "",
    repos: [],
    relatedPosts: [],
  },
  {
    title: "Beta",
    slug: "beta",
    tagline: "The second project.",
    currentState: "",
    repos: [],
    relatedPosts: [],
  },
];

describe("Projects page", () => {
  it("shows the first Project's summary on initial render with no interaction", () => {
    const { container, unmount } = renderIntoDocument(<Projects projects={PROJECTS} briefs={{}} />);

    expect(container.textContent).toContain("Alpha");
    expect(container.textContent).toContain("The first project.");
    expect(container.textContent).not.toContain("The second project.");

    unmount();
  });

  it("clicking a different pill swaps the summary client-side, with no navigation", () => {
    const { container, unmount } = renderIntoDocument(<Projects projects={PROJECTS} briefs={{}} />);

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
    const { container, unmount } = renderIntoDocument(<Projects projects={PROJECTS} briefs={{}} />);

    const wrapper = container.querySelector('[data-testid="project-summary-swap"]');
    expect(wrapper).not.toBeNull();
    const classes = wrapper?.className.split(/\s+/) ?? [];
    expect(classes).toContain("motion-safe:transition-opacity");
    expect(classes).toContain("motion-safe:duration-200");
    expect(classes).not.toContain("transition-opacity");

    unmount();
  });

  it("wires the active tab's aria-controls to a rendered tabpanel via matching id/aria-labelledby", () => {
    const { container, unmount } = renderIntoDocument(<Projects projects={PROJECTS} briefs={{}} />);

    const alphaTab = container.querySelector('[role="tab"][aria-selected="true"]') as HTMLElement;
    expect(alphaTab).toBeTruthy();
    const controlsId = alphaTab.getAttribute("aria-controls");
    expect(controlsId).toBe("project-panel-alpha");

    const panel = container.querySelector(`#${controlsId}`);
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute("role")).toBe("tabpanel");
    expect(panel?.getAttribute("aria-labelledby")).toBe(alphaTab.id);

    unmount();
  });
});
