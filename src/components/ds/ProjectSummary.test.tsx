import { describe, expect, it } from "vitest";
import type { Project } from "@/data/projects";
import { ProjectSummary } from "./ProjectSummary";
import { renderIntoDocument } from "./testUtils";

const PROJECT: Project = {
  title: "Portfolio Site",
  slug: "portfolio-site",
  tagline: "A statically-generated portfolio and blog.",
  repos: [{ role: "frontend", techKeys: ["nextjs", "react"] }],
  relatedPosts: [{ label: "Building the tablist", slug: "building-the-tablist" }],
  capabilities: [],
  roadmap: {
    milestoneName: "MVP",
    features: [{ name: "Ship the seam pattern", status: "shipped", phase: "toward" }],
  },
};

describe("ProjectSummary", () => {
  it("renders the Project's title as an h1 and its tagline", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectSummary project={PROJECT} percent={50} legend="50% to MVP" />
    );

    const heading = container.querySelector("h1");
    expect(heading?.textContent).toBe(PROJECT.title);
    expect(container.textContent).toContain(PROJECT.tagline);

    unmount();
  });

  it("renders the meter with the given value and legend", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectSummary project={PROJECT} percent={50} legend="50% to MVP" />
    );

    const meter = container.querySelector('[role="progressbar"]');
    expect(meter?.getAttribute("aria-valuenow")).toBe("50");
    expect(container.querySelector('[data-slot="meter-legend"]')?.textContent).toBe("50% to MVP");

    unmount();
  });

  it("renders a real Roadmap jump link to #roadmap", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectSummary project={PROJECT} percent={50} legend="50% to MVP" />
    );

    const link = Array.from(container.querySelectorAll("a")).find((anchor) =>
      anchor.textContent?.includes("Roadmap")
    );

    expect(link?.getAttribute("href")).toBe("#roadmap");

    unmount();
  });

  it("still renders the meter unchanged at 100%, no special state", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectSummary project={PROJECT} percent={100} legend="100% to MVP" />
    );

    const meter = container.querySelector('[role="progressbar"]');
    expect(meter?.getAttribute("aria-valuenow")).toBe("100");
    expect(container.querySelector('[data-slot="meter-legend"]')?.textContent).toBe("100% to MVP");

    unmount();
  });

  it("renders tech badges resolved via the techPresentation seam, not raw literals", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectSummary project={PROJECT} percent={50} legend="50% to MVP" />
    );

    const badges = container.querySelectorAll('[data-slot="badge"]');
    const categories = Array.from(badges).map((badge) => badge.getAttribute("data-category"));

    expect(categories).toContain("gray-blue"); // nextjs
    expect(categories).toContain("sky"); // react

    unmount();
  });

  it("omits the role-label gutter for a single-repo Project", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectSummary project={PROJECT} percent={50} legend="50% to MVP" />
    );

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
      <ProjectSummary project={multiRepoProject} percent={50} legend="50% to MVP" />
    );

    expect(container.textContent).toContain("Frontend");
    expect(container.textContent).toContain("Backend");

    unmount();
  });

  it("renders related-Post cards linking to /blog/[slug]", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectSummary project={PROJECT} percent={50} legend="50% to MVP" />
    );

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
      <ProjectSummary project={projectWithoutRelatedPosts} percent={50} legend="50% to MVP" />
    );

    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(0);

    unmount();
  });
});
