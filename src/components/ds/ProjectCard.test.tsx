import { describe, expect, it } from "vitest";
import type { Project } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { renderIntoDocument } from "./testUtils";

const PROJECT: Project = {
  title: "Bondsmith",
  slug: "bondsmith",
  tagline: "A spec-driven development workflow engine in Rust.",
  repos: [{ role: "backend", techKeys: ["rust"] }],
  relatedPosts: [],
  capabilities: [],
  roadmap: { milestoneName: "MVP", features: [] },
};

describe("ProjectCard", () => {
  it("renders the Project's title and tagline", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectCard project={PROJECT} figure="50% to MVP" href="/projects/bondsmith" />
    );

    expect(container.textContent).toContain(PROJECT.title);
    expect(container.textContent).toContain(PROJECT.tagline);

    unmount();
  });

  it("links the title to the Project's detail route", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectCard project={PROJECT} figure="50% to MVP" href="/projects/bondsmith" />
    );

    const link = Array.from(container.querySelectorAll("a")).find((anchor) =>
      anchor.textContent?.includes(PROJECT.title)
    );

    expect(link).not.toBeUndefined();
    expect(link?.getAttribute("href")).toBe("/projects/bondsmith");

    unmount();
  });

  it("renders the pre-resolved Milestone Progress figure verbatim", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectCard project={PROJECT} figure="Maturity reached" href="/projects/bondsmith" />
    );

    const figure = container.querySelector('[data-slot="milestone-figure"]');

    expect(figure?.textContent).toBe("Maturity reached");

    unmount();
  });

  it("renders no meter bar and no progressbar role", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectCard project={PROJECT} figure="50% to MVP" href="/projects/bondsmith" />
    );

    expect(container.querySelector('[role="progressbar"]')).toBeNull();
    expect(container.querySelector('[data-slot="meter-group"]')).toBeNull();

    unmount();
  });

  it("renders tech badges resolved via the techPresentation seam", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectCard project={PROJECT} figure="50% to MVP" href="/projects/bondsmith" />
    );

    const badges = container.querySelectorAll('[data-slot="badge"]');
    const categories = Array.from(badges).map((badge) => badge.getAttribute("data-category"));

    expect(categories).toContain("orange"); // rust

    unmount();
  });
});
