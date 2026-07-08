import type { PostCardCategory } from "@/components/ds/PostCard";
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

export const samplePostCoverImageUrl = "/images/profile.jpg";

export const samplePostCategories: readonly PostCardCategory[] = [
  { label: "Leadership", category: "violet" },
  { label: "Management", category: "gray-blue" },
  { label: "Presentation", category: "pink" },
];

/**
 * A ~9-entry Post set (all real-`Post`-typed) sized so the `Pages/Home` blog
 * index reads correctly: a "Recent blog posts" featured cluster, a 3-column
 * "All blog posts" grid, and pagination. `samplePost` stays first so the
 * single-Post consumers (PostCard/SinglePost/Author stories) keep working.
 */
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
  {
    slug: "migrating-to-linear-101",
    title: "Migrating to Linear 101",
    dek: "Linear helps streamline software projects, sprints, tasks, and bug tracking. Here's how to get started.",
    date: "2026-03-18",
    readingTimeMinutes: 5,
    formattedDate: "March 18, 2026",
    published: true,
  },
  {
    slug: "building-your-api-stack",
    title: "Building your API Stack",
    dek: "The rise of RESTful APIs has been met by a rise in tools for creating, testing, and managing them.",
    date: "2026-03-01",
    readingTimeMinutes: 7,
    formattedDate: "March 1, 2026",
    published: true,
  },
  {
    slug: "grid-systems-for-design",
    title: "Grid systems for better Design User Interface",
    dek: "A grid system is a design tool used to arrange content on a webpage in a consistent, structured way.",
    date: "2026-02-14",
    readingTimeMinutes: 6,
    formattedDate: "February 14, 2026",
    published: true,
  },
  {
    slug: "bill-walsh-leadership-lessons",
    title: "Bill Walsh leadership lessons",
    dek: "Like to know the secrets of transforming a 2-14 team into a 3x Super Bowl winning dynasty?",
    date: "2026-01-30",
    readingTimeMinutes: 8,
    formattedDate: "January 30, 2026",
    published: true,
  },
  {
    slug: "pm-mental-models",
    title: "PM mental models",
    dek: "Mental models are simple expressions of complex processes or relationships every PM should know.",
    date: "2026-01-12",
    readingTimeMinutes: 5,
    formattedDate: "January 12, 2026",
    published: true,
  },
  {
    slug: "what-is-wireframing",
    title: "What is Wireframing?",
    dek: "Introduction to Wireframing and its principles. Learn from the best in the industry.",
    date: "2025-12-20",
    readingTimeMinutes: 4,
    formattedDate: "December 20, 2025",
    published: true,
  },
  {
    slug: "how-collaboration-makes-us-better",
    title: "How collaboration makes us better designers",
    dek: "Collaboration can make our teams stronger, and our individual designs better.",
    date: "2025-12-03",
    readingTimeMinutes: 6,
    formattedDate: "December 3, 2025",
    published: true,
  },
];
