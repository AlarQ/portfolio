import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
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
});
