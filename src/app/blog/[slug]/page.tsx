import { notFound } from "next/navigation";
import { getPosts } from "@/data/posts";

// Build-time snapshot of the loader's already-validated Post set. The loader is
// the SINGLE slug-validation gate; this route maps its output and never
// re-validates — invalid slugs are unrepresentable past the loader seam.
const POSTS = getPosts();
const SLUG_SET = new Set(POSTS.map((post) => post.slug));

export function generateStaticParams(): Array<{ slug: string }> {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  // O(1) membership check against the build-time Post set — no FS read, no
  // TOCTOU window. A slug absent from the loader output has no Post.
  if (!SLUG_SET.has(slug)) notFound();

  // Dynamic import over content/posts; slug is a member of the loader's
  // already-validated set, so only whitelisted paths can reach this call.
  const { default: PostBody } = await import(`../../../../content/posts/${slug}.mdx`);

  return <PostBody />;
}
