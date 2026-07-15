import { describe, expect, it } from "vitest";
import { generateMetadata, generateStaticParams } from "./page";

describe("generateMetadata", () => {
  it("returns an empty object for a slug with no Brief-having Project", async () => {
    // Given a slug that matches no Brief-having Project (no Project currently
    // ships a content/projects/<slug>.mdx body, so the Brief-having set is empty)
    const params = Promise.resolve({ slug: "does-not-exist" });

    // When generateMetadata resolves the route's metadata
    const metadata = await generateMetadata({ params });

    // Then no title is set, mirroring the blog route's unknown-slug behavior
    expect(metadata).toEqual({});
  });
});

describe("generateStaticParams", () => {
  it("generate_static_params_maps_projects_ts_set_never_globs", () => {
    // When generateStaticParams enumerates routes
    const result = generateStaticParams();

    // Then it returns exactly the validated Brief-having projects.ts slug set
    // (via buildProjectSet/filterProjectsWithBrief) — not a filesystem glob over
    // content/projects/. No Project currently has a Brief body, so the set is
    // empty and the /projects/[slug] route publishes zero pages.
    expect(result).toEqual([]);
  });
});
