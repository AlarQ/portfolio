import type { ReactNode } from "react";
import { PostLayout } from "@/components/ds/PostLayout";
import type { CategoryName } from "@/data/categories";
import type { PostAdjacency } from "@/data/postLoader";
import type { Post } from "@/data/posts";
import type { TocEntry } from "@/data/postToc";
import { categoryPresentation } from "@/utils/categoryPresentation";

export interface SinglePostProps {
  readonly post: Post;
  readonly children: ReactNode;
  readonly toc?: readonly TocEntry[];
  readonly adjacency?: PostAdjacency;
  readonly coverImageUrl?: string;
  readonly coverImageAlt?: string;
  readonly categories?: readonly CategoryName[];
}

/**
 * `Pages/SinglePost` screen: composes the Task 006 `PostLayout` organism
 * (which itself composes `AuthorInfo`, `PageInfo`, `ArticleProse` with hero,
 * ToC, prev/next nav, category badges, `Conclusion`, `Newsletter`, `Footer`)
 * around a Post's body.
 *
 * This is the seam that resolves `categories` (vocabulary `CategoryName[]`,
 * loader output) into hued `Badge` props via `categoryPresentation` — the
 * caller (the route) hands off plain loader data and never resolves color
 * itself (CLAUDE.md seam pattern).
 */
export function SinglePost({
  post,
  children,
  toc,
  adjacency,
  coverImageUrl,
  coverImageAlt,
  categories,
}: SinglePostProps) {
  return (
    <PostLayout
      post={post}
      toc={toc}
      adjacency={adjacency}
      coverImageUrl={coverImageUrl}
      coverImageAlt={coverImageAlt}
      categories={categories?.map((name) => ({
        label: name,
        category: categoryPresentation(name),
      }))}
    >
      {children}
    </PostLayout>
  );
}
