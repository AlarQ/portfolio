import { describe, expect, it, vi } from "vitest";
import type { Project } from "@/data/projects";
import { buildBriefs } from "./page";

// Stands in for the real `content/projects/hyperion.mdx` Brief body so
// `ProjectsPage`'s default import path is exercised without needing an
// MDX-capable loader in the vitest environment.
vi.mock("../../../content/projects/hyperion.mdx", () => ({
  default: () => "Hyperion Brief body",
}));

function project(overrides: Partial<Project>): Project {
  return {
    title: "Sample Project",
    slug: "sample-project",
    tagline: "A sample project.",
    currentState: "Building the core loop.",
    repos: [],
    relatedPosts: [],
    ...overrides,
  };
}

describe("buildBriefs", () => {
  it("keys the resulting map by each Project's slug", async () => {
    const briefProjects = [project({ slug: "alpha" }), project({ slug: "beta" })];

    const briefs = await buildBriefs(briefProjects, async (slug) => ({
      default: () => `Brief body for ${slug}`,
    }));

    expect(Object.keys(briefs)).toEqual(["alpha", "beta"]);
  });

  it("renders each Brief's imported default export as the map's value", async () => {
    const briefProjects = [project({ slug: "alpha" })];

    const briefs = await buildBriefs(briefProjects, async () => ({
      default: () => "Alpha Brief content",
    }));

    expect(briefs.alpha).toBeTruthy();
  });

  it("returns an empty map when there are no Brief-having Projects", async () => {
    const briefs = await buildBriefs([], async () => ({ default: () => null }));

    expect(briefs).toEqual({});
  });
});

describe("ProjectsPage", () => {
  it("renders the page chrome around the Projects screen using the real Brief import", async () => {
    const { default: ProjectsPage } = await import("./page");
    const element = await ProjectsPage();

    expect(element).toBeTruthy();
  });
});
