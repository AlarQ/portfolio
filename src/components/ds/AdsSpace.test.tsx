import { describe, expect, it } from "vitest";
import { AdsSpace } from "./AdsSpace";
import { renderIntoDocument } from "./testUtils";

describe("AdsSpace", () => {
  it("renders a placeholder ad slot composed from the shadcn Card primitive", () => {
    const { container, unmount } = renderIntoDocument(<AdsSpace />);

    const card = container.querySelector('[data-slot="card"]');
    expect(card).not.toBeNull();
    expect(container.textContent).toContain("Advertisement");

    unmount();
  });
});
