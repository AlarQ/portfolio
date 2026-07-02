import { toHtml } from "hast-util-to-html";
import rehypeSlug from "rehype-slug";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { heading } from "./mdxPresentationText";

/** Runs the same rehype-slug step configured in next.config.ts's rehypePlugins. */
function slugifyHeading(markdown: string): string {
  const tree = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    .runSync(unified().use(remarkParse).parse(markdown));
  const html = toHtml(tree);
  const match = html.match(/id="([^"]+)"/);
  if (!match) throw new Error(`no heading id produced for: ${markdown}`);
  return match[1];
}

describe("heading seam", () => {
  it("renders an id-bearing element when the id prop is present", () => {
    // Given a heading factory for h2, as rehype-slug would spread an id prop
    const Heading = heading("h2");

    // When called with an id prop (mirrors what rehype-slug spreads onto the element)
    const element = Heading({ id: "section-title", children: "Section title" });

    // Then the rendered heading element carries that id
    expect(element.props.id).toBe("section-title");
  });

  it("renders an anchor affordance linking to the id when id is present", () => {
    // Given a heading factory for h2
    const Heading = heading("h2");

    // When called with an id prop
    const element = Heading({ id: "section-title", children: "Section title" });

    // Then the heading's children include an anchor pointing at #<id>
    const children = element.props.children as ReturnType<typeof Heading>[];
    const anchor = Array.isArray(children)
      ? children.find((c) => c?.props?.href === "#section-title")
      : undefined;
    expect(anchor).toBeDefined();
  });

  it("renders no anchor affordance when id is absent", () => {
    // Given a heading factory for h2
    const Heading = heading("h2");

    // When called without an id prop
    const element = Heading({ children: "Section title" });

    // Then no anchor affordance is rendered
    const children = element.props.children as ReturnType<typeof Heading>[];
    const anchor = Array.isArray(children)
      ? children.find((c) => c?.props?.href !== undefined)
      : undefined;
    expect(anchor).toBeUndefined();
  });
});

describe("heading id slugging (rehype-slug pipeline, as wired in next.config.ts)", () => {
  it("derives a stable, deterministic id from heading text across separate runs", () => {
    // Given a heading with fixed text
    const markdown = "## Section Title";

    // When the same content is processed twice (simulating two separate builds)
    const firstBuild = slugifyHeading(markdown);
    const secondBuild = slugifyHeading(markdown);

    // Then the id is identical build-to-build
    expect(firstBuild).toBe("section-title");
    expect(secondBuild).toBe("section-title");
  });
});
