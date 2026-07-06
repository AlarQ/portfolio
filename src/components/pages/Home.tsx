import { Footer } from "@/components/ds/Footer";
import { Newsletter } from "@/components/ds/Newsletter";
import { PostCard } from "@/components/ds/PostCard";
import type { Post } from "@/data/posts";

export interface HomeProps {
  readonly posts: readonly Post[];
}

/**
 * `Pages/Home` screen: composes Task 006 organisms (`PostCard`, `Newsletter`,
 * `Footer`) into the site's landing screen. Owns layout/ordering only; each
 * organism owns its own rendering.
 */
export function Home({ posts }: HomeProps) {
  return (
    <div className="flex flex-col gap-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground">Latest posts</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <Newsletter heading="Get new posts by email" />
      </div>
      <Footer />
    </div>
  );
}
