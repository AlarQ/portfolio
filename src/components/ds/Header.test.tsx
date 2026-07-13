import { describe, expect, it } from "vitest";
import { navItems } from "@/data/navItems";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { Header } from "./Header";
import { renderIntoDocument } from "./testUtils";

describe("Header", () => {
  it("renders the brand label and every nav item as an anchor", () => {
    const { container, unmount } = renderIntoDocument(
      <Header items={sampleNavItems} brandLabel="Jane Doe" />
    );

    expect(container.textContent).toContain("Jane Doe");
    for (const item of sampleNavItems) {
      const anchor = container.querySelector(`a[href="${item.href}"]`);
      expect(anchor).not.toBeNull();
      expect(anchor?.textContent).toBe(item.label);
    }

    unmount();
  });

  it("applies the active state only to the activeHref item", () => {
    const { container, unmount } = renderIntoDocument(
      <Header items={sampleNavItems} activeHref="/blog" />
    );

    const active = container.querySelector('a[href="/blog"]');
    const inactive = container.querySelector('a[href="/projects"]');
    expect(active?.getAttribute("aria-current")).toBe("page");
    expect(active?.className).toContain("font-bold");
    expect(inactive?.getAttribute("aria-current")).toBeNull();
    expect(inactive?.className).toContain("font-normal");

    unmount();
  });

  it("exposes the real navItems Projects link and marks it active on /projects", () => {
    const { container, unmount } = renderIntoDocument(
      <Header items={navItems} activeHref="/projects" />
    );

    const projectsLink = container.querySelector('a[href="/projects"]');
    expect(projectsLink?.textContent).toBe("Projects");
    expect(projectsLink?.getAttribute("aria-current")).toBe("page");
    expect(projectsLink?.className).toContain("font-bold");

    unmount();
  });

  it("renders the masthead heading only when a title is passed", () => {
    const without = renderIntoDocument(<Header items={sampleNavItems} />);
    expect(without.container.querySelector("header h1")).toBeNull();
    without.unmount();

    const withTitle = renderIntoDocument(<Header items={sampleNavItems} title="THE BLOG" />);
    const masthead = withTitle.container.querySelector("header h1");
    expect(masthead?.textContent).toBe("THE BLOG");
    withTitle.unmount();
  });
});
