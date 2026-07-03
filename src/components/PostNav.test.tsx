import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Post } from "@/data/posts";
import { PostNav } from "./PostNav";

/**
 * Component-level coverage for `PostNav`, standing in for the e2e cases
 * (`e2e_middle_post_shows_both_links...`, `e2e_boundary_post_shows_only_one_link`)
 * that need >=2-3 Posts to exercise meaningfully. `content/posts/` currently
 * holds a single real Post (see task 003 repo-reality note), so there is no
 * real multi-Post route to drive through Playwright. Static-markup rendering
 * over fixture props exercises the same rendered contract (href + label text)
 * without inventing a fixture-content-dir mechanism the repo doesn't have.
 */

const post = (slug: string, title: string): Post => ({
  slug,
  title,
  dek: "d",
  date: "2026-01-01",
  readingTimeMinutes: 1,
  formattedDate: "1 January 2026",
  published: true,
});

describe("PostNav — middle Post (both neighbors)", () => {
  it("shows both a Newer and an Older link, each resolving to the neighbor's slug", () => {
    const prev = post("newer-post", "Newer Post");
    const next = post("older-post", "Older Post");

    const html = renderToStaticMarkup(<PostNav prev={prev} next={next} />);

    expect(html).toContain('href="/blog/newer-post"');
    expect(html).toContain("Newer post");
    expect(html).toContain("Newer Post");
    expect(html).toContain('href="/blog/older-post"');
    expect(html).toContain("Older post");
    expect(html).toContain("Older Post");
  });
});

describe("PostNav — boundary Post (one-sided)", () => {
  it("shows only the Older link when there is no newer neighbor", () => {
    const next = post("older-post", "Older Post");

    const html = renderToStaticMarkup(<PostNav next={next} />);

    expect(html).not.toContain("Newer post");
    expect(html).toContain('href="/blog/older-post"');
    expect(html).toContain("Older post");
  });

  it("shows only the Newer link when there is no older neighbor", () => {
    const prev = post("newer-post", "Newer Post");

    const html = renderToStaticMarkup(<PostNav prev={prev} />);

    expect(html).not.toContain("Older post");
    expect(html).toContain('href="/blog/newer-post"');
    expect(html).toContain("Newer post");
  });
});

describe("PostNav — single-Post set (neither neighbor)", () => {
  it("renders neither link and no error occurs", () => {
    expect(() => renderToStaticMarkup(<PostNav />)).not.toThrow();

    const html = renderToStaticMarkup(<PostNav />);
    expect(html).toBe("");
  });
});
