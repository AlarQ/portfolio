import type { Post } from "@/data/posts";

/**
 * FR-8 / type-safety.md guardrail: the real `Post` interface (src/data/posts.ts)
 * requires `published`. A Post-shaped object that omits it must fail to
 * compile — proving the fixture can't silently drift from production shape.
 * Verified mechanically: temporarily delete the `@ts-expect-error` line below
 * and run `npm run type-check` — tsc errors on the missing `published` field.
 * Restore the comment once confirmed.
 *
 * This is a compile-time-only check (not a Storybook story), so it lives
 * here rather than in Home.stories.tsx. It is not picked up by Storybook's
 * indexer since it has no `.stories.` in its filename.
 */
// @ts-expect-error — Post requires `published`; omitting it must not compile.
const invalidPost: Post = {
  title: "Invalid Fixture (omits required published field)",
  dek: "This object is intentionally missing a required Post field.",
  date: "2026-01-01",
  readingTimeMinutes: 3,
  formattedDate: "January 1, 2026",
};
void invalidPost;
