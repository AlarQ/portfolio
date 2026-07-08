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
    // Newsletter: renders the "Stories and interviews" signup form.
    expect(container.querySelector("form")).not.toBeNull();
    expect(container.textContent).toContain("Stories and interviews");
    // Footer: renders the site footer landmark.
    expect(container.querySelector("footer")).not.toBeNull();

    unmount();
  });

  it("renders the optional hero image and category badges when supplied", () => {
    const { container, unmount } = renderIntoDocument(
      <PostLayout
        post={samplePost}
        coverImageUrl="/images/profile.jpg"
        coverImageAlt="Hero"
        categories={[{ label: "Leadership", category: "violet" }]}
      >
        <p>Body content</p>
      </PostLayout>
    );

    // ArticleProse hero: an <img> with the supplied alt text.
    expect(container.querySelector('img[alt="Hero"]')).not.toBeNull();
    // Category badge row: renders each category label.
    expect(container.textContent).toContain("Leadership");

    unmount();
  });
});
