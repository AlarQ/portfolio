import { describe, expect, it } from "vitest";
import { samplePost } from "@/stories/fixtures/posts";
import { PostCard } from "./PostCard";
import { renderIntoDocument } from "./testUtils";

describe("PostCard", () => {
  it("renders the Post's title and dek, composed inside a shadcn Card", () => {
    const { container, unmount } = renderIntoDocument(<PostCard post={samplePost} />);

    expect(container.textContent).toContain(samplePost.title);
    expect(container.textContent).toContain(samplePost.dek);
    expect(container.querySelector('[data-slot="card"]')).not.toBeNull();

    unmount();
  });
});
