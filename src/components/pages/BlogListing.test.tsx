import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import { samplePosts } from "@/stories/fixtures/posts";
import { BlogListing } from "./BlogListing";

describe("BlogListing", () => {
  it("renders a full screen listing every Post via PostCard organisms plus the Footer", () => {
    const { container, unmount } = renderIntoDocument(<BlogListing posts={samplePosts} />);

    for (const post of samplePosts) {
      expect(container.textContent).toContain(post.title);
      expect(container.textContent).toContain(post.dek);
    }
    expect(container.querySelector("footer")).not.toBeNull();

    unmount();
  });
});
