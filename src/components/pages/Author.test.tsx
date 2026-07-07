import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import { samplePosts } from "@/stories/fixtures/posts";
import { Author } from "./Author";

describe("Author", () => {
  it("renders a full screen composing AuthorInfo, that author's PostCards, and the Footer", () => {
    const { container, unmount } = renderIntoDocument(<Author posts={samplePosts} />);

    expect(container.textContent).toContain("EB");
    for (const post of samplePosts) {
      expect(container.textContent).toContain(post.title);
    }
    expect(container.querySelector("footer")).not.toBeNull();

    unmount();
  });
});
