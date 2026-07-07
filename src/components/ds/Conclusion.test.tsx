import { describe, expect, it } from "vitest";
import { Conclusion } from "./Conclusion";
import { renderIntoDocument } from "./testUtils";

describe("Conclusion", () => {
  it("renders heading, body text, and an optional CTA composed from a shadcn Button", () => {
    const { container, unmount } = renderIntoDocument(
      <Conclusion
        heading="Ready to build your own?"
        body="Start with a small, honest token layer and let it grow with the design."
        ctaLabel="Read the next post"
        ctaHref="/blog/the-seam-pattern"
      />
    );

    expect(container.textContent).toContain("Ready to build your own?");
    expect(container.textContent).toContain(
      "Start with a small, honest token layer and let it grow with the design."
    );
    const cta = container.querySelector('[data-slot="button"]');
    expect(cta).not.toBeNull();
    expect(cta?.textContent).toContain("Read the next post");

    unmount();
  });
});
