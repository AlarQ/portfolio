import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/PostArticle";
import { getPost, getPosts } from "@/data/posts";

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

  return (
    <PostArticle title={post.title}>
      <PostBody />
    </PostArticle>
  );
}
