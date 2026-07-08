import { describe, expect, it } from "vitest";
import { defaultFooterLinks } from "@/data/footerLinks";
import { Footer } from "./Footer";
import { renderIntoDocument } from "./testUtils";

describe("Footer", () => {
  it("renders the footer landmark", () => {
    const { container, unmount } = renderIntoDocument(<Footer />);
    expect(container.querySelector("footer")).not.toBeNull();
    unmount();
  });

  it("renders each default link with an icon", () => {
    const { container, unmount } = renderIntoDocument(<Footer />);
    for (const link of defaultFooterLinks) {
      const anchor = container.querySelector(`a[href="${link.href}"]`);
      expect(anchor).not.toBeNull();
      expect(anchor?.textContent).toContain(link.label);
      // each link carries its resolved icon (LinkedIn inline SVG / lucide Mail|Rss)
      expect(anchor?.querySelector("svg")).not.toBeNull();
    }
    unmount();
  });

  it("hardens external links and leaves internal ones untouched", () => {
    const { container, unmount } = renderIntoDocument(<Footer />);
    const linkedin = container.querySelector<HTMLAnchorElement>(
      'a[href^="https://www.linkedin.com"]'
    );
    expect(linkedin?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(linkedin?.getAttribute("target")).toBe("_blank");

    const rss = container.querySelector<HTMLAnchorElement>('a[href="/feed.xml"]');
    expect(rss?.getAttribute("rel")).toBeNull();
    expect(rss?.getAttribute("target")).toBeNull();
    unmount();
  });

  it("is prop-driven — renders custom links and copyright name", () => {
    const { container, unmount } = renderIntoDocument(
      <Footer links={[{ label: "Only", href: "#only", icon: "email" }]} copyrightName="Jane Doe" />
    );
    expect(container.textContent).toContain("Jane Doe");
    expect(container.querySelectorAll("nav a")).toHaveLength(1);
    unmount();
  });
});
