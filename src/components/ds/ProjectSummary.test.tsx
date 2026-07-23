import { describe, expect, it } from "vitest";
import type { Project } from "@/data/projects";
import { ProjectSummary } from "./ProjectSummary";
import { renderIntoDocument } from "./testUtils";

const PROJECT: Project = {
  title: "Portfolio Site",
  slug: "portfolio-site",
  tagline: "A statically-generated portfolio and blog.",
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

  it("renders the current state", () => {
    const { container, unmount } = renderIntoDocument(<ProjectSummary project={PROJECT} />);

    expect(container.textContent).toContain(PROJECT.currentState);

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

  it("renders the Brief content inline when brief is provided", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectSummary project={PROJECT} brief={<p>Brief prose content.</p>} />
    );

    expect(container.textContent).toContain("Brief prose content.");

    unmount();
  });

  it("omits the inline Brief section when brief is undefined", () => {
    const { container, unmount } = renderIntoDocument(<ProjectSummary project={PROJECT} />);

    expect(container.textContent).not.toContain("Brief prose content.");

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
