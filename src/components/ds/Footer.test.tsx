import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";
import { renderIntoDocument } from "./testUtils";

describe("Footer", () => {
  it("renders without throwing", () => {
    const { container, unmount } = renderIntoDocument(<Footer />);

    expect(container.querySelector("footer")).not.toBeNull();

    unmount();
  });
});
