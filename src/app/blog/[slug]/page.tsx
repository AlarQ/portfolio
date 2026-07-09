import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SinglePost } from "@/components/pages/SinglePost";
import { getAdjacentPosts } from "@/data/postLoader";
import { getPost, getPosts } from "@/data/posts";
import { getPostToc } from "@/data/postToc";

export function generateStaticParams(): Array<{ slug: string }> {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/** Per-Post document title (FR-9): the detail `<title>` reflects the Post. */
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return post ? { title: post.title } : {};
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  // The loader's validated Post set is the single source of truth: a slug with
  // no Post has no detail page, and the looked-up Post supplies the page <h1>.
  const post = getPost(slug);
  if (!post) notFound();

  // Dynamic import over content/posts; slug is a member of the loader's
  // already-validated set, so only whitelisted paths can reach this call.
  const { default: PostBody } = await import(`../../../../content/posts/${slug}.mdx`);

  // ToC derived from the same validated slug — no second slug gate (CLAUDE.md).
  // pages/SinglePost owns the prose/ToC/nav layout; the route just hands off data.
  const toc = getPostToc(slug);

  // Adjacency walks the loader's already-ordered, already-validated Post set —
  // no independent slug source, no second gate (single slug-validation gate).
  const adjacency = getAdjacentPosts(getPosts(), slug);

  // The route resolves nothing visual: `coverImageUrl`/`categories` are passed
  // through as plain loader data (Post.coverImage / Post.categories); the
  // category → Badge hue resolution happens inside pages/SinglePost via the
  // categoryPresentation seam (CLAUDE.md seam pattern).
  return (
    <SinglePost
      post={post}
      toc={toc}
      adjacency={adjacency}
      coverImageUrl={post.coverImage}
      categories={post.categories}
    >
      <PostBody />
    </SinglePost>
  );
}
