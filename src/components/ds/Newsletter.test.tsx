import { describe, expect, it } from "vitest";
import { Newsletter } from "./Newsletter";
import { renderIntoDocument } from "./testUtils";

describe("Newsletter", () => {
  it("renders a heading, an email Input, and a submit Button", () => {
    const { container, unmount } = renderIntoDocument(
      <Newsletter heading="Subscribe for updates" ctaLabel="Subscribe" />
    );

    expect(container.textContent).toContain("Subscribe for updates");
    expect(container.querySelector('[data-slot="input"]')).not.toBeNull();
    const button = container.querySelector('[data-slot="button"]');
    expect(button).not.toBeNull();
    expect(button?.textContent).toContain("Subscribe");

    unmount();
  });
});
