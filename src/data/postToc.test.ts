import { describe, expect, it } from "vitest";
import { extractPostToc } from "./postToc";

describe("extractPostToc", () => {
  it("returns depth/text/id entries for nested ##/### headings in document order", () => {
    const markdown = ["## Setup", "", "### Install", "", "## Usage"].join("\n");

    const toc = extractPostToc(markdown);

    expect(toc).toEqual([
      { depth: 2, text: "Setup", id: "setup" },
      { depth: 3, text: "Install", id: "install" },
      { depth: 2, text: "Usage", id: "usage" },
    ]);
  });

  it("omits the H1 post title and returns [] for a post with no ##/### headings", () => {
    const withH1 = ["# Post Title", "", "## Real Section"].join("\n");
    const noHeadings = "Just a paragraph of prose with no headings at all.";

    expect(extractPostToc(withH1)).toEqual([
      { depth: 2, text: "Real Section", id: "real-section" },
    ]);
    expect(extractPostToc(noHeadings)).toEqual([]);
  });
});
