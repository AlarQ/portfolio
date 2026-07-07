import type { ReactNode } from "react";
import { PostLayout } from "@/components/ds/PostLayout";
import type { Post } from "@/data/posts";

export interface SinglePostProps {
  readonly post: Post;
  readonly children: ReactNode;
}

/**
 * `Pages/SinglePost` screen: composes the Task 006 `PostLayout` organism
 * (which itself composes `AuthorInfo`, `PageInfo`, `ArticleProse`,
 * `AdsSpace`, `Conclusion`, `Newsletter`, `Footer`) around a Post's body.
 */
export function SinglePost({ post, children }: SinglePostProps) {
  return <PostLayout post={post}>{children}</PostLayout>;
}
