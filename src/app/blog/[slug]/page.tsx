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

// Computed once at module load (build time) — no per-render FS reads.
const SLUGS = discoverSlugs();
const SLUG_SET = new Set(SLUGS);

export function generateStaticParams(): Array<{ slug: string }> {
  return SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  // O(1) check against build-time snapshot — no TOCTOU window, no FS read.
  if (!SLUG_SET.has(slug)) notFound();

  // Dynamic import uses a webpack context over content/posts; slug is pre-validated
  // against SLUG_SET above so only whitelisted paths can reach this call.
  const { default: PostBody } = await import(`../../../../content/posts/${slug}.mdx`);

  return <PostBody />;
}
