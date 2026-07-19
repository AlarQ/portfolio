import { describe, expect, it } from "vitest";
import { samplePosts } from "@/stories/fixtures/posts";
import { PrevNextNav } from "./PrevNextNav";
import { renderIntoDocument } from "./testUtils";

/**
 * `prevnext_renders_only_existing_neighbor_at_collection_edges`.
 *
 * Component-level coverage of the three collection-edge states. Preserves the
 * live blog's e2e contract (`e2e/blog-nav.spec.ts`): the `<nav>` accessible
 * name is exactly "Post navigation", the newer neighbour is a "Newer post"
 * link and the older neighbour an "Older post" link, each resolving to
 * `/blog/${slug}`. Route-level navigation itself stays 004's e2e concern.
 */

const [newer, older] = samplePosts;

describe("PrevNextNav - middle Post (both neighbours)", () => {
  it("renders both a Newer and an Older link resolving to each neighbour's slug", () => {
    const { container, unmount } = renderIntoDocument(<PrevNextNav prev={newer} next={older} />);

    const nav = container.querySelector("nav");
    expect(nav?.getAttribute("aria-label")).toBe("Post navigation");

    const newerLink = container.querySelector(`a[href="/blog/${newer.slug}"]`);
    expect(newerLink?.textContent).toContain("Newer post");
    expect(newerLink?.textContent).toContain(newer.title);

    const olderLink = container.querySelector(`a[href="/blog/${older.slug}"]`);
    expect(olderLink?.textContent).toContain("Older post");
    expect(olderLink?.textContent).toContain(older.title);

    unmount();
  });
});

describe("PrevNextNav - collection edges (one-sided)", () => {
  it("renders only the Older link at the newest edge (no newer neighbour)", () => {
    const { container, unmount } = renderIntoDocument(<PrevNextNav next={older} />);

    expect(container.querySelector("nav")?.textContent).not.toContain("Newer post");
    const olderLink = container.querySelector(`a[href="/blog/${older.slug}"]`);
    expect(olderLink?.textContent).toContain("Older post");
    expect(container.querySelectorAll("a")).toHaveLength(1);

    unmount();
  });

  it("renders only the Newer link at the oldest edge (no older neighbour)", () => {
    const { container, unmount } = renderIntoDocument(<PrevNextNav prev={newer} />);

    expect(container.querySelector("nav")?.textContent).not.toContain("Older post");
    const newerLink = container.querySelector(`a[href="/blog/${newer.slug}"]`);
    expect(newerLink?.textContent).toContain("Newer post");
    expect(container.querySelectorAll("a")).toHaveLength(1);

    unmount();
  });

  it("renders nothing when the Post has no neighbours", () => {
    const { container, unmount } = renderIntoDocument(<PrevNextNav />);

    expect(container.querySelector("nav")).toBeNull();

    unmount();
  });
});
