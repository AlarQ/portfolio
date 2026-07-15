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

  it("wires action/method and email name/required when action is set", () => {
    const { container, unmount } = renderIntoDocument(
      <Newsletter heading="Subscribe" action="https://example.com/embed-subscribe/fixture" />
    );

    const form = container.querySelector("form");
    expect(form?.getAttribute("action")).toBe("https://example.com/embed-subscribe/fixture");
    expect(form?.getAttribute("method")).toBe("post");
    const input = container.querySelector('[data-slot="input"]');
    expect(input?.getAttribute("name")).toBe("email");
    expect(input?.hasAttribute("required")).toBe(true);

    unmount();
  });

  it("omits action/method and email name/required without action", () => {
    const { container, unmount } = renderIntoDocument(<Newsletter heading="Subscribe" />);

    const form = container.querySelector("form");
    expect(form?.hasAttribute("action")).toBe(false);
    expect(form?.hasAttribute("method")).toBe(false);
    const input = container.querySelector('[data-slot="input"]');
    expect(input?.hasAttribute("name")).toBe(false);
    expect(input?.hasAttribute("required")).toBe(false);

    unmount();
  });
});
