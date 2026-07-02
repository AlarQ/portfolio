import { readFileSync } from "node:fs";
import { join } from "node:path";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";

/**
 * One entry in a Post's Table of Contents: a `##` (depth 2) or `###` (depth 3)
 * section heading, its rendered plain text, and the slug `id` that the section
 * heading carries in the DOM. Carries no JSX/color — presentation lives in the
 * `PostToc` component (ADR-0001 seam pattern).
 */
export interface TocEntry {
  readonly depth: 2 | 3;
  readonly text: string;
  readonly id: string;
}

const ATX_HEADING = /^(#{2,3})\s+(.+?)\s*#*\s*$/;

/**
 * Strip the inline Markdown that a heading's rendered text node does NOT carry,
 * so the slug is fed the exact text `rehype-slug` sees (backtick-wrapped code
 * keeps its inner text, links keep their label, emphasis markers drop). Lone
 * underscores are preserved — `github-slugger` keeps them, so stripping them
 * would break id parity with the DOM.
 */
function headingText(raw: string): string {
  return raw
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .trim();
}

/**
 * Pure core: derive a Post's ToC tree from its Markdown body. Reuses the exact
 * `github-slugger` instance-per-document that `rehype-slug` uses in the build
 * pipeline, so every `id` here matches the heading `id` rendered to the DOM
 * (including its de-duplication counter). No filesystem dependency — the impure
 * rind hands it an already-read body.
 */
export function extractPostToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];

  for (const line of markdown.split("\n")) {
    const match = ATX_HEADING.exec(line);
    if (!match) continue;

    const depth = match[1].length as 2 | 3;
    const text = headingText(match[2]);
    entries.push({ depth, text, id: slugger.slug(text) });
  }

  return entries;
}

const POSTS_DIR = join(process.cwd(), "content", "posts");

/**
 * Impure rind: read a Post's body off disk and derive its ToC. `slug` MUST be a
 * member of the loader's already-validated set (`getPosts` → `buildPostSet`);
 * the detail page looks the Post up there before calling this, so no second
 * slug-validation gate is introduced (single slug gate, CLAUDE.md). Frontmatter
 * is stripped so only the prose body reaches the pure extractor.
 */
export function getPostToc(slug: string): TocEntry[] {
  const raw = readFileSync(join(POSTS_DIR, `${slug}.mdx`), "utf-8");
  return extractPostToc(matter(raw).content);
}
