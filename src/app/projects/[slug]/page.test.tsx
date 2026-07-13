import { describe, expect, it } from "vitest";
import { generateMetadata, generateStaticParams } from "./page";

describe("generateMetadata", () => {
  it("generate_metadata_sets_per_brief_title", async () => {
    // Given a valid Project slug ("portfolio-site", the first entry in projects.ts)
    const params = Promise.resolve({ slug: "portfolio-site" });

    // When generateMetadata resolves the route's metadata
    const metadata = await generateMetadata({ params });

    // Then the <title> reflects the Project's title
    expect(metadata).toEqual({ title: "Portfolio Site" });
  });

  it("returns an empty object for an unknown slug, mirroring the blog route", async () => {
    // Given a slug with no matching Project
    const params = Promise.resolve({ slug: "does-not-exist" });

    // When generateMetadata resolves the route's metadata
    const metadata = await generateMetadata({ params });

    // Then no title is set
    expect(metadata).toEqual({});
  });
});

describe("generateStaticParams", () => {
  it("generate_static_params_maps_projects_ts_set_never_globs", () => {
    // When generateStaticParams enumerates routes
    const result = generateStaticParams();

    // Then it returns exactly the validated projects.ts slug set (via
    // buildProjectSet/projectLoader.ts) — not a filesystem glob over
    // content/projects/, which currently holds only "portfolio-site.mdx".
    expect(result).toEqual([{ slug: "portfolio-site" }]);
  });
});
