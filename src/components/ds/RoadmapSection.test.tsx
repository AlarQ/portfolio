import { describe, expect, it } from "vitest";
import type { Roadmap } from "@/data/projects";
import { deriveMilestoneProgress } from "@/data/roadmap";
import { RoadmapSection } from "./RoadmapSection";
import { renderIntoDocument } from "./testUtils";

const ROADMAP: Roadmap = {
  milestoneName: "MVP",
  features: [
    { name: "Shipped one", status: "shipped", phase: "toward" },
    { name: "Shipped two", status: "shipped", phase: "toward" },
    { name: "In progress one", status: "in-progress", phase: "toward" },
    { name: "Planned one", status: "planned", phase: "toward" },
    { name: "Beyond one", status: "planned", phase: "beyond" },
    { name: "Beyond two", status: "planned", phase: "beyond" },
  ],
};

describe("RoadmapSection", () => {
  it("renders a toward <ol>, a visible divider, an After heading, and a beyond <ol>, in order", () => {
    const { container, unmount } = renderIntoDocument(
      <RoadmapSection progress={deriveMilestoneProgress(ROADMAP)} />
    );

    const lists = container.querySelectorAll("ol");
    expect(lists).toHaveLength(2);

    const towardTexts = Array.from(lists[0]?.children ?? []).map((li) => li.textContent?.trim());
    expect(towardTexts).toEqual([
      "Shipped: Shipped one",
      "Shipped: Shipped two",
      "In progress: In progress one",
      "Planned: Planned one",
    ]);

    const divider = Array.from(container.querySelectorAll("p")).find((p) =>
      p.textContent?.includes("shipped")
    );
    expect(divider?.textContent?.trim()).toBe("MVP · 2 of 4 shipped");

    const heading = container.querySelector("h3");
    expect(heading?.textContent).toBe("After MVP");

    const beyondTexts = Array.from(lists[1]?.children ?? []).map((li) => li.textContent?.trim());
    expect(beyondTexts).toEqual(["Planned: Beyond one", "Planned: Beyond two"]);

    // Divider and heading are not aria-hidden - SR users get the grouping.
    expect(divider?.hasAttribute("aria-hidden")).toBe(false);
    expect(heading?.hasAttribute("aria-hidden")).toBe(false);

    unmount();
  });

  it("has heading id=roadmap and section aria-labelledby=roadmap", () => {
    const { container, unmount } = renderIntoDocument(
      <RoadmapSection progress={deriveMilestoneProgress(ROADMAP)} />
    );

    const section = container.querySelector("section");
    const heading = container.querySelector("h2#roadmap");

    expect(section?.getAttribute("aria-labelledby")).toBe("roadmap");
    expect(heading).not.toBeNull();

    unmount();
  });

  it("renders no visible status text but includes it in each row's accessible name", () => {
    const { container, unmount } = renderIntoDocument(
      <RoadmapSection progress={deriveMilestoneProgress(ROADMAP)} />
    );

    const srOnly = container.querySelectorAll(".sr-only");
    const srTexts = Array.from(srOnly).map((el) => el.textContent);

    expect(srTexts).toContain("Shipped: ");
    expect(srTexts).toContain("In progress: ");
    expect(srTexts).toContain("Planned: ");

    unmount();
  });

  it("renders no meter / progressbar", () => {
    const { container, unmount } = renderIntoDocument(
      <RoadmapSection progress={deriveMilestoneProgress(ROADMAP)} />
    );

    expect(container.querySelector('[role="progressbar"]')).toBeNull();

    unmount();
  });

  it("omits the beyond caption when there are no beyond Features", () => {
    const towardOnly: Roadmap = {
      milestoneName: "MVP",
      features: [{ name: "Only one", status: "shipped", phase: "toward" }],
    };
    const { container, unmount } = renderIntoDocument(
      <RoadmapSection progress={deriveMilestoneProgress(towardOnly)} />
    );

    expect(container.textContent).not.toContain("After MVP");
    expect(container.querySelector("h3")).toBeNull();
    expect(container.querySelectorAll("ol")).toHaveLength(1);

    unmount();
  });

  it("binds the divider's StatusDot to the success tone once every toward Feature has shipped", () => {
    const complete: Roadmap = {
      milestoneName: "MVP",
      features: [{ name: "Only one", status: "shipped", phase: "toward" }],
    };
    const { container, unmount } = renderIntoDocument(
      <RoadmapSection progress={deriveMilestoneProgress(complete)} />
    );

    const dot = container.querySelector('[data-slot="status-dot"]');
    expect(dot?.getAttribute("data-tone")).toBe("success");

    unmount();
  });

  it("binds the divider's StatusDot to the muted tone while toward Features remain unshipped", () => {
    const { container, unmount } = renderIntoDocument(
      <RoadmapSection progress={deriveMilestoneProgress(ROADMAP)} />
    );

    // ROADMAP has 4 `toward` Features, each with its own leading StatusDot;
    // the divider's StatusDot is the 5th.
    const dots = container.querySelectorAll('[data-slot="status-dot"]');
    const dividerDot = dots[4];
    expect(dividerDot?.getAttribute("data-tone")).toBe("muted");

    unmount();
  });
});
