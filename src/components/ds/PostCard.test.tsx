import { describe, expect, it } from "vitest";
import {
  samplePost,
  samplePostCategories,
  samplePostCoverImageUrl,
} from "@/stories/fixtures/posts";
import { PostCard } from "./PostCard";
import { renderIntoDocument } from "./testUtils";

describe("PostCard", () => {
  it("renders the Post's title and dek", () => {
    const { container, unmount } = renderIntoDocument(<PostCard post={samplePost} />);

    expect(container.textContent).toContain(samplePost.title);
    expect(container.textContent).toContain(samplePost.dek);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector('[data-slot="badge"]')).toBeNull();

    unmount();
  });

  it("renders a cover image and category badges when provided", () => {
    const { container, unmount } = renderIntoDocument(
      <PostCard
        post={samplePost}
        coverImageUrl={samplePostCoverImageUrl}
        categories={samplePostCategories}
      />
    );

    const image = container.querySelector("img");
    expect(image).not.toBeNull();
    expect(image?.getAttribute("src")).toContain(encodeURIComponent(samplePostCoverImageUrl));

    const badges = container.querySelectorAll('[data-slot="badge"]');
    expect(badges).toHaveLength(samplePostCategories.length);
    for (const c of samplePostCategories) {
      expect(container.textContent).toContain(c.label);
    }

    unmount();
  });
});
