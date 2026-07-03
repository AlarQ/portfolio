import { toHtml } from "hast-util-to-html";
import rehypeSlug from "rehype-slug";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { heading, InlineCode, Paragraph, proseTextSx } from "./mdxPresentationText";

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

describe("prose rhythm and scale (task 005)", () => {
  it("Paragraph renders at the 18px/1.7 reading spec (not the old 1.75) via the shared proseTextSx token", () => {
    // Given the Paragraph seam, which consumes proseTextSx
    const element = Paragraph({ children: "Some prose" });

    // Then its rendered sx reflects the 18px / 1.7 rhythm directly, not merely
    // matching proseTextSx.fontSize/lineHeight back to themselves
    const sx = element.props.sx as Record<string, unknown>;
    expect(sx.fontSize).toBe("1.125rem");
    expect(sx.lineHeight).toBe(1.7);
    // And it does so by spreading the shared token rather than a per-component override
    expect(sx.fontSize).toBe(proseTextSx.fontSize);
    expect(sx.lineHeight).toBe(proseTextSx.lineHeight);
  });

  it("InlineCode scales relative to the surrounding prose (em-based), not a fixed px value", () => {
    // Given an inline code element (not a highlighted block — no data-language)
    const element = InlineCode({ children: "const x" });

    // Then its font-size is relative (em/rem), keeping code-in-text scale consistent
    // with whatever prose size it sits inside — never a raw px literal.
    const sx = element.props.sx as Record<string, unknown>;
    expect(String(sx.fontSize)).toMatch(/(em|rem)$/);
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
