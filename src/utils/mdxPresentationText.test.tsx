import { toHtml } from "hast-util-to-html";
import rehypeSlug from "rehype-slug";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { heading, InlineCode, Paragraph } from "./mdxPresentationText";

/**
 * Runs rehype-slug standalone to assert the library's id-slugging is deterministic.
 * This does NOT exercise next.config.ts's wiring — that is covered by
 * e2e/blog-anchors.spec.ts (which drives the real build pipeline).
 */
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

describe("prose rhythm and scale (route migration)", () => {
  it("Paragraph binds the 18px/1.7 reading spec through semantic-token utilities, not an sx literal", () => {
    // Given the Paragraph seam
    const element = Paragraph({ children: "Some prose" });

    // Then it carries the reading scale as Tailwind token utilities: 18px body
    // (`text-lg`), the pinned 1.7 rhythm, and the semantic muted-foreground hue.
    const className = element.props.className as string;
    expect(className).toContain("text-lg");
    expect(className).toContain("leading-[1.7]");
    expect(className).toContain("text-muted-foreground");

    // And no MUI sx object — styling now flows through the token layer, not sx.
    expect(element.props.sx).toBeUndefined();
  });

  it("InlineCode scales relative to the surrounding prose (em-based), not a fixed px value", () => {
    // Given an inline code element (not a highlighted block — no data-language)
    const element = InlineCode({ children: "const x" });

    // Then its font-size utility is em-based, keeping code-in-text scale
    // consistent with whatever prose size it sits inside — never a raw px literal.
    const className = element.props.className as string;
    expect(className).toMatch(/text-\[[\d.]+em\]/);
  });
});

describe("heading id slugging (rehype-slug library determinism; wiring covered by e2e)", () => {
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
