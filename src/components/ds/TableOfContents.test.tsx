import { describe, expect, it } from "vitest";
import type { TocEntry } from "@/data/postToc";
import { TableOfContents, TOC_ACCESSIBLE_NAME } from "./TableOfContents";
import { renderIntoDocument } from "./testUtils";

const sampleEntries: readonly TocEntry[] = [
  { depth: 2, text: "The boundary I keep pushing out", id: "the-boundary-i-keep-pushing-out" },
  { depth: 2, text: "Composing over re-implementing", id: "composing-over-re-implementing" },
  { depth: 3, text: "A worked example", id: "a-worked-example" },
  { depth: 2, text: "Where it pays off", id: "where-it-pays-off" },
];

describe("TableOfContents", () => {
  it("toc_accessible_name_matches_existing_e2e_contract_string", () => {
    const { container, unmount } = renderIntoDocument(<TableOfContents entries={sampleEntries} />);

    const nav = container.querySelector("nav");
    // Byte-for-byte the accessible name `e2e/blog-toc.spec.ts` asserts via
    // getByRole("navigation", { name: TOC_ACCESSIBLE_NAME }).
    expect(nav?.getAttribute("aria-label")).toBe(TOC_ACCESSIBLE_NAME);

    unmount();
  });

  it("links every top-level (depth 2) entry to its rehype-slug heading id in document order", () => {
    const { container, unmount } = renderIntoDocument(<TableOfContents entries={sampleEntries} />);

    const topLevelEntries = sampleEntries.filter((entry) => entry.depth === 2);
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(topLevelEntries.map((entry) => `#${entry.id}`));

    for (const entry of topLevelEntries) {
      const link = container.querySelector(`a[href="#${entry.id}"]`);
      expect(link?.textContent).toBe(entry.text);
    }

    unmount();
  });

  it("drops depth-3 subsection entries from the rail", () => {
    const { container, unmount } = renderIntoDocument(<TableOfContents entries={sampleEntries} />);

    const depth3Entry = sampleEntries.find((entry) => entry.depth === 3);
    expect(depth3Entry).toBeDefined();
    expect(container.querySelector(`a[href="#${depth3Entry?.id}"]`)).toBeNull();

    unmount();
  });

  it("renders nothing when the heading tree is empty", () => {
    const { container, unmount } = renderIntoDocument(<TableOfContents entries={[]} />);

    expect(container.querySelector("nav")).toBeNull();

    unmount();
  });

  it("marks only the activeId's link with aria-current=location", () => {
    const activeEntry = sampleEntries[1];
    const { container, unmount } = renderIntoDocument(
      <TableOfContents entries={sampleEntries} activeId={activeEntry.id} />
    );

    for (const entry of sampleEntries.filter((e) => e.depth === 2)) {
      const link = container.querySelector(`a[href="#${entry.id}"]`);
      if (entry.id === activeEntry.id) {
        expect(link?.getAttribute("aria-current")).toBe("location");
      } else {
        expect(link?.getAttribute("aria-current")).toBeNull();
      }
    }

    unmount();
  });
});
