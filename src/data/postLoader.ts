import matter from "gray-matter";
import { JSON_SCHEMA, load as loadYaml } from "js-yaml";
import type { Post } from "./posts";

// Parse frontmatter under YAML's JSON schema so every value stays a primitive
// string — in particular, an unquoted `date: 2026-02-30` is NOT auto-cast to a
// JS Date (the default schema rolls it silently to March 2 before the loader
// can reject it). Keeping it a string makes `requireDate` the single authority.
const FRONTMATTER_OPTIONS = {
  engines: { yaml: (raw: string) => loadYaml(raw, { schema: JSON_SCHEMA }) as object },
};

const WORDS_PER_MINUTE = 200;
const SLUG_PATTERN = /^[a-z0-9-]+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A raw post file as read off disk by the fs rind: the filename (e.g.
 * `my-spec-driven-workflow.mdx`) and the unparsed file contents (frontmatter + body).
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
  const { data, content: body } = matter(file.content, FRONTMATTER_OPTIONS);

  const title = requireField(file, "title", data.title);
  const date = requireDate(file, data.date);

  return {
    slug,
    title,
    dek: requireField(file, "dek", data.dek),
    date,
    readingTimeMinutes: readingTime(body),
    formattedDate: formatDate(date),
    published: true,
  };
}

/**
 * Fail fast on a missing/empty frontmatter string. Posts are 100%
 * owner-authored at build time (CLAUDE.md, ADR-0001), so a blank field is an
 * authoring bug to surface loudly — not a runtime condition to absorb with a
 * silent `?? ""`. The thrown message names the offending file for `npm run build`.
 */
function requireField(file: RawPostFile, key: string, value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) return value;
  throw new Error(`[posts] "${file.filename}": frontmatter "${key}" is missing or empty`);
}

/**
 * Fail fast on a missing, non-ISO, or impossible date — same authoring-bug
 * rationale. The shape regex alone is not enough: JS rolls `2026-02-30` over to
 * March 2 instead of rejecting it, so a real calendar date must round-trip back
 * to the same string (that round-trip also rejects `2026-13-45`, whose Date is
 * NaN). The value is always a string here — FRONTMATTER_OPTIONS keeps YAML dates
 * unparsed — so this check is the single authority on date validity.
 */
function requireDate(file: RawPostFile, value: unknown): string {
  if (typeof value === "string" && ISO_DATE_PATTERN.test(value)) {
    const parsed = new Date(`${value}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value) {
      return value;
    }
  }
  throw new Error(
    `[posts] "${file.filename}": frontmatter "date" must be a real ISO YYYY-MM-DD date`
  );
}

function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
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
