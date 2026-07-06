import { describe, expect, it } from "vitest";
import { AuthorInfo } from "./AuthorInfo";
import { renderIntoDocument } from "./testUtils";

describe("AuthorInfo", () => {
  it("renders the author's name and role, composed with a shadcn Avatar", () => {
    const { container, unmount } = renderIntoDocument(
      <AuthorInfo name="Ernest Bednarczyk" title="Software Engineer" fallback="EB" />
    );

    expect(container.textContent).toContain("Ernest Bednarczyk");
    expect(container.textContent).toContain("Software Engineer");
    expect(container.querySelector('[data-slot="avatar"]')).not.toBeNull();

    unmount();
  });
});
