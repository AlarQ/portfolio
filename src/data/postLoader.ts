import type { Post } from "./posts";

const WORDS_PER_MINUTE = 200;
const SLUG_PATTERN = /^[a-z0-9-]+$/;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

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
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return isoDate;
  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1] ?? month;
  return `${Number(day)} ${monthName} ${year}`;
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
  return raw.split("\n").reduce<Record<string, string>>((acc, line) => {
    const separator = line.indexOf(":");
    if (separator === -1) return acc;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key.length > 0) acc[key] = value;
    return acc;
  }, {});
}
