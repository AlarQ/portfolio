import { describe, expect, it } from "vitest";
import type { Project } from "@/data/projects";
import { ProjectSummary } from "./ProjectSummary";
import { renderIntoDocument } from "./testUtils";

const PROJECT: Project = {
  title: "Portfolio Site",
  slug: "portfolio-site",
  tagline: "A statically-generated portfolio and blog.",
  status: "in-progress",
  mvpProgress: 80,
  currentState: "Building the Projects tab.",
  techStack: ["nextjs", "react"],
  relatedPosts: [{ label: "Building the tablist", slug: "building-the-tablist" }],
};

describe("ProjectSummary", () => {
  it("renders the active Project's title and tagline", () => {
    const { container, unmount } = renderIntoDocument(<ProjectSummary project={PROJECT} />);

    expect(container.textContent).toContain(PROJECT.title);
    expect(container.textContent).toContain(PROJECT.tagline);

    unmount();
  });

  it("renders Status via the presentation seam (tone + label) and current state", () => {
    const { container, unmount } = renderIntoDocument(<ProjectSummary project={PROJECT} />);

    expect(container.textContent).toContain("In progress");
    expect(container.querySelector('[data-slot="status-dot"][data-tone="info"]')).not.toBeNull();
    expect(container.textContent).toContain(PROJECT.currentState);

    unmount();
  });

  it("renders the MVP-progress meter fed project.mvpProgress", () => {
    const { container, unmount } = renderIntoDocument(<ProjectSummary project={PROJECT} />);

    const meter = container.querySelector('[data-slot="meter"]');
    expect(meter).not.toBeNull();
    expect(meter?.getAttribute("aria-valuenow")).toBe("80");

    unmount();
  });

  it("renders tech badges resolved via the techPresentation seam, not raw literals", () => {
    const { container, unmount } = renderIntoDocument(<ProjectSummary project={PROJECT} />);

    const badges = container.querySelectorAll('[data-slot="badge"]');
    const categories = Array.from(badges).map((badge) => badge.getAttribute("data-category"));

    expect(categories).toContain("gray-blue"); // nextjs
    expect(categories).toContain("sky"); // react

    unmount();
  });

  it("renders related-Post links to /blog/[slug]", () => {
    const { container, unmount } = renderIntoDocument(<ProjectSummary project={PROJECT} />);

    const link = Array.from(container.querySelectorAll("a")).find(
      (anchor) => anchor.textContent === "Building the tablist"
    );

    expect(link).not.toBeUndefined();
    expect(link?.getAttribute("href")).toBe("/blog/building-the-tablist");

    unmount();
  });

  it('renders a "Read full brief" link when briefHref is passed', () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectSummary project={PROJECT} briefHref="/projects/portfolio-site" />
    );

    const link = Array.from(container.querySelectorAll("a")).find(
      (anchor) => anchor.textContent === "Read full brief"
    );

    expect(link).not.toBeUndefined();
    expect(link?.getAttribute("href")).toBe("/projects/portfolio-site");

    unmount();
  });

  it('omits the "Read full brief" link when briefHref is not passed', () => {
    const { container, unmount } = renderIntoDocument(<ProjectSummary project={PROJECT} />);

    const link = Array.from(container.querySelectorAll("a")).find(
      (anchor) => anchor.textContent === "Read full brief"
    );

    expect(link).toBeUndefined();

    unmount();
  });
});
