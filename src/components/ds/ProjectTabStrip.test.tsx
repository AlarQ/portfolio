import { act } from "react";
import { describe, expect, it, vi } from "vitest";
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
    repos: [],
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

describe("ProjectTabStrip - ARIA tablist keyboard navigation (FR-5, FR-7)", () => {
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

describe("ProjectTabStrip - single-row scroll-snap rail with chevrons + dots", () => {
  it("keeps the tablist a single scroll-snapping row and renders scroll chevrons + one dot per project", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectTabStrip projects={PROJECTS} selectedSlug="alpha" onSelectSlug={() => {}} />
    );

    const tablist = container.querySelector('[role="tablist"]') as HTMLElement;
    expect(tablist).toBeTruthy();
    expect(tablist.className).toMatch(/flex-nowrap/);
    expect(tablist.className).toMatch(/snap-x/);
    expect(tablist.className).toMatch(/snap-mandatory/);
    expect(tablist.className).toMatch(/overflow-x-auto/);

    expect(container.querySelector('[aria-label="Scroll left"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Scroll right"]')).toBeTruthy();

    const dots = container.querySelectorAll('[data-testid="project-tab-strip-dot"]');
    expect(dots).toHaveLength(PROJECTS.length);

    unmount();
  });

  it("scroll chevrons call scrollBy on the rail without throwing", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectTabStrip projects={PROJECTS} selectedSlug="alpha" onSelectSlug={() => {}} />
    );

    const rail = container.querySelector('[role="tablist"]') as HTMLElement;
    const scrollBy = vi.fn();
    rail.scrollBy = scrollBy;

    const left = container.querySelector('[aria-label="Scroll left"]') as HTMLElement;
    const right = container.querySelector('[aria-label="Scroll right"]') as HTMLElement;

    act(() => {
      left.click();
    });
    expect(scrollBy).toHaveBeenCalledWith({ left: -160, behavior: "smooth" });

    act(() => {
      right.click();
    });
    expect(scrollBy).toHaveBeenCalledWith({ left: 160, behavior: "smooth" });

    unmount();
  });
});
