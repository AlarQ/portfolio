import { readdirSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";

const POSTS_DIR = join(process.cwd(), "content", "posts");
const SLUG_PATTERN = /^[a-z0-9-]+$/;

function discoverSlugs(): string[] {
  return readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
    .filter((slug) => SLUG_PATTERN.test(slug));
}

export function generateStaticParams(): Array<{ slug: string }> {
  return discoverSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  if (!discoverSlugs().includes(slug)) {
    notFound();
  }

  const { default: PostBody } = await import(`../../../../content/posts/${slug}.mdx`);

  return <PostBody />;
}
