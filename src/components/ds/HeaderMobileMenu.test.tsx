import { act } from "react";
import { describe, expect, it } from "vitest";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { HeaderMobileMenu } from "./HeaderMobileMenu";
import { renderIntoDocument } from "./testUtils";

/** Dispatch a bubbling click so React's delegated handler fires, wrapped in act. */
function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function trigger(container: Element) {
  const button = container.querySelector("button");
  if (!button) throw new Error("trigger button not found");
  return button;
}

/** The drawer renders into a body portal, so it is queried off document. */
function drawer() {
  return document.getElementById("header-mobile-menu");
}

/**
 * The panel stays mounted so it can slide; "open" is signalled by the absence
 * of the `inert` attribute (closed → inert, off tab order + a11y tree).
 */
function drawerOpen() {
  const panel = drawer();
  return panel != null && !panel.hasAttribute("inert");
}

describe("HeaderMobileMenu", () => {
  it("toggles aria-expanded and the drawer's open/inert state on the trigger", () => {
    const { container, unmount } = renderIntoDocument(
      <HeaderMobileMenu items={sampleNavItems} activeHref="/blog" />
    );

    const button = trigger(container);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe("header-mobile-menu");
    expect(drawerOpen()).toBe(false);

    click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.getAttribute("aria-label")).toBe("Close menu");
    expect(drawerOpen()).toBe(true);

    click(button);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(drawerOpen()).toBe(false);

    unmount();
  });

  it("exposes the open drawer as a labelled modal dialog", () => {
    const { container, unmount } = renderIntoDocument(<HeaderMobileMenu items={sampleNavItems} />);

    click(trigger(container));
    const panel = drawer();
    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(panel?.getAttribute("aria-modal")).toBe("true");
    expect(panel?.getAttribute("aria-label")).toBe("Site menu");

    unmount();
  });

  it("renders every nav item as an anchor with the active state on activeHref", () => {
    const { container, unmount } = renderIntoDocument(
      <HeaderMobileMenu items={sampleNavItems} activeHref="/blog" />
    );

    click(trigger(container));

    for (const item of sampleNavItems) {
      const anchor = drawer()?.querySelector(`a[href="${item.href}"]`);
      expect(anchor).not.toBeNull();
      expect(anchor?.textContent).toBe(item.label);
    }

    const active = drawer()?.querySelector('a[href="/blog"]');
    const inactive = drawer()?.querySelector('a[href="/projects"]');
    expect(active?.getAttribute("aria-current")).toBe("page");
    expect(active?.className).toContain("font-bold");
    expect(inactive?.getAttribute("aria-current")).toBeNull();
    expect(inactive?.className).toContain("font-normal");

    unmount();
  });

  it("closes the drawer when a nav link is clicked", () => {
    const { container, unmount } = renderIntoDocument(
      <HeaderMobileMenu items={sampleNavItems} activeHref="/blog" />
    );

    click(trigger(container));
    const link = drawer()?.querySelector('a[href="/blog"]');
    if (!link) throw new Error("nav link not found");
    click(link);
    expect(drawerOpen()).toBe(false);

    unmount();
  });

  it("closes the drawer on Escape and restores focus to the trigger", () => {
    const { container, unmount } = renderIntoDocument(<HeaderMobileMenu items={sampleNavItems} />);

    const button = trigger(container);
    click(button);
    expect(drawerOpen()).toBe(true);

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(drawerOpen()).toBe(false);
    expect(document.activeElement).toBe(button);

    unmount();
  });

  it("closes the drawer when the backdrop scrim is clicked", () => {
    const { container, unmount } = renderIntoDocument(<HeaderMobileMenu items={sampleNavItems} />);

    click(trigger(container));
    const scrim = document.querySelector(".bg-black\\/50");
    if (!scrim) throw new Error("scrim not found");
    click(scrim);
    expect(drawerOpen()).toBe(false);

    unmount();
  });

  it("locks body scroll while the drawer is open", () => {
    const { container, unmount } = renderIntoDocument(<HeaderMobileMenu items={sampleNavItems} />);

    const button = trigger(container);
    expect(document.body.style.overflow).toBe("");

    click(button);
    expect(document.body.style.overflow).toBe("hidden");

    click(button);
    expect(document.body.style.overflow).toBe("");

    unmount();
  });

  it("keeps the theme pill non-interactive (aria-hidden)", () => {
    const { container, unmount } = renderIntoDocument(<HeaderMobileMenu items={sampleNavItems} />);

    click(trigger(container));
    const pill = drawer()?.querySelector('[aria-hidden="true"]');
    expect(pill).not.toBeNull();

    unmount();
  });
});
