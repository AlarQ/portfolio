import type { ReactNode } from "react";
import type { PostCardCategory } from "@/components/ds/PostCard";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/data/posts";
import { ArticleProse } from "./ArticleProse";
import { AuthorInfo } from "./AuthorInfo";
import { Conclusion } from "./Conclusion";
import { Footer } from "./Footer";
import { Newsletter } from "./Newsletter";
import { PageInfo } from "./PageInfo";

export interface PostLayoutProps {
  readonly post: Post;
  readonly children: ReactNode;
  readonly coverImageUrl?: string;
  readonly coverImageAlt?: string;
  readonly categories?: readonly PostCardCategory[];
}

/**
 * Bespoke `Bespoke -> Bespoke` organism composing the pack's molecules
 * (Task 005) — `AuthorInfo`, `PageInfo`, `ArticleProse` (with hero),
 * category `Badge` row, `Conclusion`, `Newsletter` — plus `Footer` around a
 * Post's body content, aligned to the Figma "Blog – Detail Blog" frame.
 * Owns layout/ordering only; each molecule owns its own rendering.
 */
export function PostLayout({
  post,
  children,
  coverImageUrl,
  coverImageAlt,
  categories,
}: PostLayoutProps) {
  return (
    <div className="flex flex-col gap-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
        <AuthorInfo name="Ernest Bednarczyk" title="Author" fallback="EB" />
        <PageInfo formattedDate={post.formattedDate} readingTimeMinutes={post.readingTimeMinutes} />
        <ArticleProse post={post} coverImageUrl={coverImageUrl} coverImageAlt={coverImageAlt}>
          {children}
        </ArticleProse>
        {categories && categories.length > 0 ? (
          <div className="flex w-full flex-wrap items-start gap-2">
            {categories.map((c) => (
              <Badge key={c.label} category={c.category}>
                {c.label}
              </Badge>
            ))}
          </div>
        ) : null}
        <Conclusion
          heading="Thanks for reading"
          body="If this was useful, more like it are on the way."
          ctaLabel="Back to the blog"
          ctaHref="/blog"
        />
        <Newsletter
          heading="Stories and interviews"
          description="Subscribe to learn about new product features, the latest in technology, solutions, and updates."
          hint="We care about your data in our"
          privacyHref="/privacy"
        />
      </div>
      <Footer />
    </div>
  );
}
