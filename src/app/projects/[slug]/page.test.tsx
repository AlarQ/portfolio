import { describe, expect, it, vi } from "vitest";
import { getProjects } from "@/data/projects";

vi.mock("../../../../content/projects/hyperion.mdx", () => ({
  default: () => "Hyperion Brief body",
}));

vi.mock("../../../../content/projects/bondsmith.mdx", () => ({
  default: () => "Bondsmith Brief body",
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("generateStaticParams", () => {
  it("maps the already-validated, Brief-having getProjects() set", async () => {
    const { generateStaticParams } = await import("./page");

    expect(generateStaticParams()).toEqual(
      getProjects().map((project) => ({ slug: project.slug }))
    );
  });
});

describe("generateMetadata", () => {
  it("sets title to the Project title and description to its tagline", async () => {
    const { generateMetadata } = await import("./page");
    const [first] = getProjects();
    if (!first) throw new Error("expected at least one published Project");

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: first.slug }) });

    expect(metadata).toEqual({ title: first.title, description: first.tagline });
  });
});

describe("ProjectPage", () => {
  it("renders the ProjectDetail body for a valid slug", async () => {
    const { default: ProjectPage } = await import("./page");
    const [first] = getProjects();
    if (!first) throw new Error("expected at least one published Project");

    const element = await ProjectPage({ params: Promise.resolve({ slug: first.slug }) });

    expect(element).toBeTruthy();
  });

  it("calls notFound() for an unknown slug", async () => {
    const { default: ProjectPage } = await import("./page");

    await expect(
      ProjectPage({ params: Promise.resolve({ slug: "does-not-exist" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
