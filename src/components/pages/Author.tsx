import { AuthorInfo } from "@/components/ds/AuthorInfo";
import { Footer } from "@/components/ds/Footer";
import { PostCard } from "@/components/ds/PostCard";
import type { Post } from "@/data/posts";

export interface AuthorProps {
  readonly posts: readonly Post[];
}

/**
 * `Pages/Author` screen: composes Task 006 organisms (`AuthorInfo`,
 * `PostCard`, `Footer`) into an author profile listing their Posts. Owns
 * layout/ordering only; each organism owns its own rendering.
 */
export function Author({ posts }: AuthorProps) {
  return (
    <div className="flex flex-col gap-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <AuthorInfo name="Ernest Bednarczyk" title="Author" fallback="EB" />
        <h2 className="text-xl font-semibold text-foreground">Posts</h2>
        <div className="grid gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
