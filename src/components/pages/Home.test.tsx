import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { samplePosts } from "@/stories/fixtures/posts";
import { Home } from "./Home";

describe("Home", () => {
  it("renders the Figma blog index: masthead, one PostCard article per post, footer, no inline newsletter", () => {
    const { container, unmount } = renderIntoDocument(
      <Home posts={samplePosts} navItems={sampleNavItems} />
    );

    // Masthead is the `ds/Header` title band, not a hand-rolled <h1>.
    expect(container.textContent).toContain("THE BLOG");

    // Every Post renders exactly once across the Recent + All sections.
    expect(container.querySelectorAll("article")).toHaveLength(samplePosts.length);
    for (const post of samplePosts) {
      expect(container.textContent).toContain(post.title);
    }

    expect(container.querySelector("footer")).not.toBeNull();

    // The blog index frame has no inline Newsletter block (the only <form>).
    expect(container.querySelector("form")).toBeNull();

    unmount();
  });
});
