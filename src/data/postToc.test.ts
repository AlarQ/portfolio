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

  it("omits ##-prefixed lines inside a fenced code block", () => {
    const markdown = [
      "## Real Section",
      "",
      "```",
      "## Setup",
      "not a heading",
      "```",
      "",
      "## Another Section",
    ].join("\n");

    expect(extractPostToc(markdown)).toEqual([
      { depth: 2, text: "Real Section", id: "real-section" },
      { depth: 2, text: "Another Section", id: "another-section" },
    ]);
  });

  it("omits the H1 post title", () => {
    const withH1 = ["# Post Title", "", "## Real Section"].join("\n");

    expect(extractPostToc(withH1)).toEqual([
      { depth: 2, text: "Real Section", id: "real-section" },
    ]);
  });

  it("strips _..._ emphasis markers from heading text and slug", () => {
    const markdown = "## Some _emphasized_ Heading";

    expect(extractPostToc(markdown)).toEqual([
      { depth: 2, text: "Some emphasized Heading", id: "some-emphasized-heading" },
    ]);
  });

  it("returns [] for a post with no ##/### headings", () => {
    const noHeadings = "Just a paragraph of prose with no headings at all.";

    expect(extractPostToc(noHeadings)).toEqual([]);
  });
});
