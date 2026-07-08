import type { ReactNode } from "react";
import type { PostCardCategory } from "@/components/ds/PostCard";
import { PostLayout } from "@/components/ds/PostLayout";
import type { Post } from "@/data/posts";

export interface SinglePostProps {
  readonly post: Post;
  readonly children: ReactNode;
  readonly coverImageUrl?: string;
  readonly coverImageAlt?: string;
  readonly categories?: readonly PostCardCategory[];
}

/**
 * `Pages/SinglePost` screen: composes the Task 006 `PostLayout` organism
 * (which itself composes `AuthorInfo`, `PageInfo`, `ArticleProse` with hero,
 * category badges, `Conclusion`, `Newsletter`, `Footer`) around a Post's body.
 */
export function SinglePost({
  post,
  children,
  coverImageUrl,
  coverImageAlt,
  categories,
}: SinglePostProps) {
  return (
    <PostLayout
      post={post}
      coverImageUrl={coverImageUrl}
      coverImageAlt={coverImageAlt}
      categories={categories}
    >
      {children}
    </PostLayout>
  );
}
