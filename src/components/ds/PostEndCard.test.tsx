import { describe, expect, it } from "vitest";
import { PostEndCard } from "./PostEndCard";
import { renderIntoDocument } from "./testUtils";

describe("PostEndCard", () => {
  it("renders the heading, a 'Back to the blog' link, and the Newsletter form", () => {
    const { container, unmount } = renderIntoDocument(
      <PostEndCard blogHref="/blog" newsletterHeading="Get new posts by email" />
    );

    expect(container.textContent).toContain("Thanks for reading");
    const links = [...container.querySelectorAll("a")];
    const blogLink = links.find((a) => a.textContent === "Back to the blog");
    expect(blogLink?.getAttribute("href")).toBe("/blog");
    expect(container.querySelector("form")).not.toBeNull();

    unmount();
  });

  it("renders the HN link with target/rel and the correct href when hnUrl is set", () => {
    const { container, unmount } = renderIntoDocument(
      <PostEndCard
        blogHref="/blog"
        hnUrl="https://news.ycombinator.com/item?id=1"
        newsletterHeading="Get new posts by email"
      />
    );

    const links = [...container.querySelectorAll("a")];
    const hnLink = links.find((a) => a.textContent?.includes("Discuss on HN"));
    expect(hnLink?.getAttribute("href")).toBe("https://news.ycombinator.com/item?id=1");
    expect(hnLink?.getAttribute("target")).toBe("_blank");
    expect(hnLink?.getAttribute("rel")).toBe("noopener noreferrer");

    unmount();
  });

  it("omits the HN button entirely when hnUrl is undefined", () => {
    const { container, unmount } = renderIntoDocument(
      <PostEndCard blogHref="/blog" newsletterHeading="Get new posts by email" />
    );

    const links = [...container.querySelectorAll("a")];
    expect(links.some((a) => a.textContent?.includes("Discuss on HN"))).toBe(false);

    unmount();
  });
});
