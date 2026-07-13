import { act } from "react";
import { describe, expect, it } from "vitest";
import type { Project } from "@/data/projects";
import { ProjectTabStrip } from "./ProjectTabStrip";
import { renderIntoDocument } from "./testUtils";

function project(overrides: Partial<Project>): Project {
  return {
    title: overrides.title ?? "Project",
    slug: overrides.slug ?? "project",
    tagline: "",
    status: overrides.status ?? "in-progress",
    mvpProgress: overrides.mvpProgress ?? 50,
    currentState: "",
    techStack: [],
    relatedPosts: [],
    ...overrides,
  };
}

const PROJECTS: readonly Project[] = [
  project({ title: "Alpha", slug: "alpha" }),
  project({ title: "Beta", slug: "beta" }),
  project({ title: "Gamma", slug: "gamma" }),
];

function tabs(container: HTMLElement) {
  return [...container.querySelectorAll('[role="tab"]')] as HTMLElement[];
}

function pressKey(el: HTMLElement, key: string) {
  act(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  });
}

describe("ProjectTabStrip — ARIA tablist keyboard navigation (FR-5, FR-7)", () => {
  it("marks the selected tab aria-selected=true and gives it the only tabIndex=0 (roving tabindex)", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectTabStrip projects={PROJECTS} selectedSlug="beta" onSelectSlug={() => {}} />
    );

    const items = tabs(container);
    expect(items).toHaveLength(3);

    const selected = items.find((t) => t.getAttribute("aria-selected") === "true");
    expect(selected?.textContent).toContain("Beta");

    for (const tab of items) {
      expect(tab.tabIndex).toBe(tab === selected ? 0 : -1);
    }

    unmount();
  });

  it("ArrowRight moves focus and selection to the next tab, wrapping past the end", () => {
    let selectedSlug = "gamma";
    const { container, unmount } = renderIntoDocument(
      <ProjectTabStrip
        projects={PROJECTS}
        selectedSlug={selectedSlug}
        onSelectSlug={(slug) => {
          selectedSlug = slug;
        }}
      />
    );

    const items = tabs(container);
    const active = items.find((t) => t.getAttribute("aria-selected") === "true") as HTMLElement;
    pressKey(active, "ArrowRight");

    expect(selectedSlug).toBe("alpha");

    unmount();
  });

  it("Home moves selection to the first tab and End to the last", () => {
    let selectedSlug = "beta";
    const { container, unmount } = renderIntoDocument(
      <ProjectTabStrip
        projects={PROJECTS}
        selectedSlug={selectedSlug}
        onSelectSlug={(slug) => {
          selectedSlug = slug;
        }}
      />
    );

    const items = tabs(container);
    const active = items.find((t) => t.getAttribute("aria-selected") === "true") as HTMLElement;

    pressKey(active, "End");
    expect(selectedSlug).toBe("gamma");

    pressKey(active, "Home");
    expect(selectedSlug).toBe("alpha");

    unmount();
  });
});

describe("ProjectTabStrip — single-row scroll-snap rail with peek-fade (200% zoom)", () => {
  it("keeps the tablist a single scroll-snapping row and renders a trailing peek-fade affordance", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectTabStrip projects={PROJECTS} selectedSlug="alpha" onSelectSlug={() => {}} />
    );

    const tablist = container.querySelector('[role="tablist"]') as HTMLElement;
    expect(tablist).toBeTruthy();
    expect(tablist.className).toMatch(/flex-nowrap/);
    expect(tablist.className).toMatch(/snap-x/);
    expect(tablist.className).toMatch(/snap-mandatory/);
    expect(tablist.className).toMatch(/overflow-x-auto/);

    const fade = container.querySelector('[data-testid="project-tab-strip-fade"]');
    expect(fade).toBeTruthy();
    expect(fade?.className).toMatch(/pointer-events-none/);

    unmount();
  });
});
