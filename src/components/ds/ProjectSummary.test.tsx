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
  repos: [{ role: "frontend", techKeys: ["nextjs", "react"] }],
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

  it("omits the role-label gutter for a single-repo Project", () => {
    const { container, unmount } = renderIntoDocument(<ProjectSummary project={PROJECT} />);

    expect(container.textContent).not.toContain("Frontend");
    expect(container.textContent).not.toContain("Backend");

    unmount();
  });

  it("renders the role-label gutter for a multi-repo Project", () => {
    const multiRepoProject: Project = {
      ...PROJECT,
      repos: [
        { role: "frontend", techKeys: ["nextjs"] },
        { role: "backend", techKeys: ["rust"] },
      ],
    };
    const { container, unmount } = renderIntoDocument(
      <ProjectSummary project={multiRepoProject} />
    );

    expect(container.textContent).toContain("Frontend");
    expect(container.textContent).toContain("Backend");

    unmount();
  });

  it("renders related-Post cards linking to /blog/[slug]", () => {
    const { container, unmount } = renderIntoDocument(<ProjectSummary project={PROJECT} />);

    const link = Array.from(container.querySelectorAll("a")).find((anchor) =>
      anchor.textContent?.includes("Building the tablist")
    );

    expect(link).not.toBeUndefined();
    expect(link?.getAttribute("href")).toBe("/blog/building-the-tablist");
    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(1);

    unmount();
  });

  it("omits the related-Post card row when there are no related posts", () => {
    const projectWithoutRelatedPosts: Project = { ...PROJECT, relatedPosts: [] };
    const { container, unmount } = renderIntoDocument(
      <ProjectSummary project={projectWithoutRelatedPosts} />
    );

    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(0);

    unmount();
  });
});
