import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { samplePost } from "@/stories/fixtures/posts";
import { mdxComponents } from "@/utils/mdxPresentation";
import { ArticleProse } from "./ArticleProse";
import { renderIntoDocument } from "./testUtils";

describe("ArticleProse", () => {
  it("renders without throwing", () => {
    const { container, unmount } = renderIntoDocument(
      <ArticleProse post={samplePost}>
        <p>Body content</p>
      </ArticleProse>
    );

    expect(container.textContent).toContain(samplePost.title);
    expect(container.textContent).toContain("Body content");

    unmount();
  });

  it("preserves the hardened MDX seam output for Post body content it renders (FR-11)", () => {
    // Body content is built exactly as the App Router's `useMDXComponents`
    // hook would produce it - via the real, already-hardened `mdxComponents`
    // map from `mdxPresentation.tsx` - never re-implemented by ArticleProse.
    const AnchorComponent = mdxComponents.a as React.ElementType;
    const ScriptComponent = mdxComponents.script as React.ElementType;
    const body = (
      <>
        {createElement(
          AnchorComponent,
          { href: "https://example.com/owner-authored" },
          "External link"
        )}
        {createElement(ScriptComponent, {}, "alert('should never render')")}
      </>
    );

    const { container, unmount } = renderIntoDocument(
      <ArticleProse post={samplePost}>{body}</ArticleProse>
    );

    const anchor = container.querySelector("a");
    expect(anchor?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(container.textContent).not.toContain("alert(");

    unmount();
  });
});
