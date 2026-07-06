import type { Post } from "@/data/posts";

/**
 * The single canonical Post fixture for Storybook/story consumption across
 * the design-system pack (005/006/007). Typed against the real `Post` from
 * `src/data/posts.ts` so a schema change surfaces here as a compile error
 * (FR-8) rather than silently drifting from production shape.
 */
export const samplePost: Post = {
  slug: "designing-with-constraints",
  title: "Designing with Constraints",
  dek: "Why a tight token layer makes a design system easier to trust, not harder to use.",
  date: "2026-05-12",
  readingTimeMinutes: 6,
  formattedDate: "May 12, 2026",
  published: true,
};

export const samplePosts: readonly Post[] = [
  samplePost,
  {
    slug: "the-seam-pattern",
    title: "The Seam Pattern",
    dek: "Data, presentation, and components as three separate layers.",
    date: "2026-04-02",
    readingTimeMinutes: 4,
    formattedDate: "April 2, 2026",
    published: true,
  },
];
