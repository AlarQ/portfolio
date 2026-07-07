import { Footer } from "@/components/ds/Footer";
import { PostCard } from "@/components/ds/PostCard";
import type { Post } from "@/data/posts";

export interface BlogListingProps {
  readonly posts: readonly Post[];
}

/**
 * `Pages/BlogListing` screen: composes Task 006 organisms (`PostCard`,
 * `Footer`) into the blog index. Owns layout/ordering only; each organism
 * owns its own rendering.
 */
export function BlogListing({ posts }: BlogListingProps) {
  return (
    <div className="flex flex-col gap-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground">Blog</h1>
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
