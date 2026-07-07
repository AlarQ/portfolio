import { describe, expect, it } from "vitest";
import { samplePost } from "@/stories/fixtures/posts";
import { PageInfo } from "./PageInfo";
import { renderIntoDocument } from "./testUtils";

describe("PageInfo", () => {
  it("renders the formatted date and reading time inside a Badge", () => {
    const { container, unmount } = renderIntoDocument(
      <PageInfo
        formattedDate={samplePost.formattedDate}
        readingTimeMinutes={samplePost.readingTimeMinutes}
      />
    );

    expect(container.textContent).toContain(samplePost.formattedDate);
    expect(container.textContent).toContain(`${samplePost.readingTimeMinutes} min read`);
    expect(container.querySelector('[data-slot="badge"]')).not.toBeNull();

    unmount();
  });
});
