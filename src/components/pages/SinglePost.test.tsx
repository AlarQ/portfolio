import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import type { PostAdjacency } from "@/data/postLoader";
import type { TocEntry } from "@/data/postToc";
import { samplePost } from "@/stories/fixtures/posts";
import { SinglePost } from "./SinglePost";

describe("SinglePost", () => {
  it("renders a full screen composing PostLayout (author, meta, prose, footer)", () => {
    const { container, unmount } = renderIntoDocument(
      <SinglePost post={samplePost}>
        <p>Body content</p>
      </SinglePost>
    );

    expect(container.textContent).toContain(samplePost.title);
    expect(container.textContent).toContain(samplePost.formattedDate);
    expect(container.textContent).toContain("Body content");
    expect(container.querySelector("footer")).not.toBeNull();

    unmount();
  });

  it("single_post_composes_loader_data_ds_components_and_route_with_no_visual_resolution_in_route", () => {
    const toc: readonly TocEntry[] = [{ depth: 2, text: "A heading", id: "a-heading" }];
    const adjacency: PostAdjacency = {
      prev: { ...samplePost, slug: "newer-post", title: "Newer Post" },
      next: { ...samplePost, slug: "older-post", title: "Older Post" },
    };

    const { container, unmount } = renderIntoDocument(
      <SinglePost
        post={samplePost}
        toc={toc}
        adjacency={adjacency}
        coverImageUrl="/images/profile.jpg"
        coverImageAlt="Cover"
        categories={["Leadership"]}
      >
        <p>Body content</p>
      </SinglePost>
    );

    // ToC entry flows through to a rendered ToC nav (loader output, not route-resolved).
    expect(
      container.querySelector('nav[aria-label="Table of contents"] a[href="#a-heading"]')
    ).not.toBeNull();

    // Adjacency flows through to prev/next nav links.
    expect(container.querySelector('a[href="/blog/newer-post"]')).not.toBeNull();
    expect(container.querySelector('a[href="/blog/older-post"]')).not.toBeNull();

    // Cover image flows through.
    expect(container.querySelector("img")).not.toBeNull();

    // Category flows through as a rendered Badge, hue resolved by the seam
    // inside the page composition - not by the caller.
    expect(container.textContent).toContain("Leadership");

    unmount();
  });
});
