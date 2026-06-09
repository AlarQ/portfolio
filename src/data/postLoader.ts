import type { Post } from "./posts";

const WORDS_PER_MINUTE = 200;
const ALLOWED_KEYS = new Set(["title", "dek", "date"]);
const MAX_VALUE_LENGTH = 512;
const SLUG_PATTERN = /^[a-z0-9-]+$/;

/**
 * A raw post file as read off disk by the fs rind: the filename (e.g.
 * `hello-world.mdx`) and the unparsed file contents (frontmatter + body).
 * The pure core `buildPostSet` takes these so it is testable without the
 * filesystem.
 */
export interface RawPostFile {
  readonly filename: string;
  readonly content: string;
}

/**
 * Pure core of the Post loader.
 *
 * Validates + derives + orders over already-read raw file inputs. Has no
 * filesystem dependency: the impure rind (`getPosts`) reads disk and hands
 * raw files here. This is the SINGLE slug-validation gate and the single home
 * of the bug-prone orchestration glue (parse, reading-time, slug-validate,
 * order).
 */
export function buildPostSet(rawFiles: readonly RawPostFile[]): Post[] {
  return rawFiles
    .filter((file) => isSlugValid(file))
    .map((file) => toPost(file))
    .sort(byNewestThenSlug);
}

function isSlugValid(file: RawPostFile): boolean {
  const slug = file.filename.replace(/\.mdx$/, "");
  if (SLUG_PATTERN.test(slug)) return true;
  console.warn(`[posts] skipping "${file.filename}": slug "${slug}" must match ${SLUG_PATTERN}`);
  return false;
}

function byNewestThenSlug(a: Post, b: Post): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

function toPost(file: RawPostFile): Post {
  const slug = file.filename.replace(/\.mdx$/, "");
  const { frontmatter, body } = splitFrontmatter(file.content);

  return {
    slug,
    title: frontmatter.title ?? "",
    dek: frontmatter.dek ?? "",
    date: frontmatter.date ?? "",
    readingTimeMinutes: readingTime(body),
    formattedDate: formatDate(frontmatter.date ?? ""),
    published: true,
  };
}

function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function readingTime(body: string): number {
  const wordCount = body.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

interface ParsedContent {
  readonly frontmatter: Readonly<Record<string, string>>;
  readonly body: string;
}

function splitFrontmatter(content: string): ParsedContent {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const [, rawFrontmatter, body] = match;
  const frontmatter = parseFrontmatter(rawFrontmatter);
  return { frontmatter, body };
}

function parseFrontmatter(raw: string): Record<string, string> {
  return Object.fromEntries(
    raw
      .split("\n")
      .filter((line) => line.includes(":"))
      .map((line) => {
        const sep = line.indexOf(":");
        const key = line.slice(0, sep).trim();
        const value = line.slice(sep + 1, sep + 1 + MAX_VALUE_LENGTH).trim();
        return [key, value] as const;
      })
      .filter(([key]) => key.length > 0 && ALLOWED_KEYS.has(key))
  );
}
