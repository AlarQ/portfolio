import { notFound } from "next/navigation";
import { getPosts } from "@/data/posts";

export function generateStaticParams(): Array<{ slug: string }> {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  const slugSet = new Set(getPosts().map((p) => p.slug));

  // O(1) membership check against the loader's validated Post set — a slug
  // absent from the loader output has no Post.
  if (!slugSet.has(slug)) notFound();

  // Dynamic import over content/posts; slug is a member of the loader's
  // already-validated set, so only whitelisted paths can reach this call.
  const { default: PostBody } = await import(`../../../../content/posts/${slug}.mdx`);

  return <PostBody />;
}
