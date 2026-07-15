import { describe, expect, it } from "vitest";
import { AreaHeadlineCard } from "./AreaHeadlineCard";
import { renderIntoDocument } from "./testUtils";

describe("AreaHeadlineCard", () => {
  it("renders the Domain Area's name and headline inside a card", () => {
    const { container, unmount } = renderIntoDocument(
      <AreaHeadlineCard name="Leadership" headline="I lead engineering teams." />
    );

    expect(container.querySelector('[data-slot="area-headline-card"]')).not.toBeNull();
    expect(container.textContent).toContain("Leadership");
    expect(container.textContent).toContain("I lead engineering teams.");

    unmount();
  });
});
