import { describe, expect, it } from "vitest";
import { navItems } from "@/data/navItems";
import { sampleNavItems } from "@/stories/fixtures/nav";
import { Header } from "./Header";
import { renderIntoDocument } from "./testUtils";

describe("Header", () => {
  it("renders the brand mark and every nav item as an anchor", () => {
    const { container, unmount } = renderIntoDocument(
      <Header items={sampleNavItems} brandLabel="Jane Doe" />
    );

    expect(container.querySelector('header a[href="/"] img')?.getAttribute("alt")).toBe("Jane Doe");
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

  it("renders the tagline and an aria-hidden slash separator when subtitle is passed", () => {
    const { container, unmount } = renderIntoDocument(
      <Header items={sampleNavItems} title="cold take" subtitle="slow thoughts on fast tech" />
    );

    const heading = container.querySelector("header h1");
    expect(heading?.textContent).toBe("cold take");
    expect(container.textContent).toContain("slow thoughts on fast tech");
    const slash = container.querySelector("header h1 + span[aria-hidden]");
    expect(slash?.textContent).toBe("/");

    // The tagline is a sibling <p>, not part of the h1 - associate it via
    // aria-describedby so screen readers pair it with the title.
    const taglineId = heading?.getAttribute("aria-describedby");
    expect(taglineId).toBeTruthy();
    expect(container.querySelector(`#${taglineId}`)?.textContent).toBe(
      "slow thoughts on fast tech"
    );

    unmount();
  });

  it("omits aria-describedby on the masthead heading when no subtitle is passed", () => {
    const { container, unmount } = renderIntoDocument(
      <Header items={sampleNavItems} title="THE BLOG" />
    );

    expect(container.querySelector("header h1")?.getAttribute("aria-describedby")).toBeNull();

    unmount();
  });
});
