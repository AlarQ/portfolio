import { describe, expect, it } from "vitest";
import { samplePost } from "@/stories/fixtures/posts";
import { PostLayout } from "./PostLayout";
import { renderIntoDocument } from "./testUtils";

describe("PostLayout", () => {
  it("renders without throwing", () => {
    const { container, unmount } = renderIntoDocument(
      <PostLayout post={samplePost}>
        <p>Body content</p>
      </PostLayout>
    );

    expect(container.textContent).toContain(samplePost.title);

    unmount();
  });

  it("composes the pack's bespoke molecules/organisms rather than re-implementing them", () => {
    const { container, unmount } = renderIntoDocument(
      <PostLayout post={samplePost}>
        <p>Body content</p>
      </PostLayout>
    );

    // AuthorInfo: renders the avatar fallback text.
    expect(container.textContent).toContain("EB");
    // PageInfo: renders the Post's formatted date and reading time.
    expect(container.textContent).toContain(samplePost.formattedDate);
    expect(container.textContent).toContain(`${samplePost.readingTimeMinutes} min read`);
    // ArticleProse: renders the Post title + body children.
    expect(container.textContent).toContain("Body content");
    // Conclusion: renders a closing heading.
    expect(container.querySelector("section h2")).not.toBeNull();
    // Newsletter: renders a signup form.
    expect(container.querySelector("form")).not.toBeNull();
    // AdsSpace: renders the ad placeholder copy.
    expect(container.textContent).toContain("Advertisement");
    // Footer: renders the site footer landmark.
    expect(container.querySelector("footer")).not.toBeNull();

    unmount();
  });
});
