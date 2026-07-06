import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import { samplePosts } from "@/stories/fixtures/posts";
import { Home } from "./Home";

describe("Home", () => {
  it("renders a full screen composing PostCard organisms and the site Footer", () => {
    const { container, unmount } = renderIntoDocument(<Home posts={samplePosts} />);

    for (const post of samplePosts) {
      expect(container.textContent).toContain(post.title);
    }
    expect(container.querySelector("footer")).not.toBeNull();

    unmount();
  });
});
