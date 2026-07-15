import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ConfirmedPage from "./page";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("ConfirmedPage", () => {
  let container: HTMLDivElement;
  // biome-ignore lint/suspicious/noExplicitAny: react-dom Root type not exported cleanly for this local test helper
  let root: any;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("confirmed_page_renders_subscription_confirmation_copy", () => {
    act(() => {
      root.render(<ConfirmedPage />);
    });

    expect(container.querySelector("h1")?.textContent).toContain("subscribed");
    expect(container.textContent).toContain("Your subscription is confirmed");
  });
});
