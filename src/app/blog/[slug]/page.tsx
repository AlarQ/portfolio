import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostReadingLayout } from "@/components/PostReadingLayout";
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
  // The reading scaffold owns the prose↔ToC layout; the route just hands off data.
  const toc = getPostToc(slug);

  return (
    <PostReadingLayout title={post.title} toc={toc}>
      <PostBody />
    </PostReadingLayout>
  );
}
