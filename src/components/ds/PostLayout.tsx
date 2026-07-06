import type { ReactNode } from "react";
import type { Post } from "@/data/posts";
import { AdsSpace } from "./AdsSpace";
import { ArticleProse } from "./ArticleProse";
import { AuthorInfo } from "./AuthorInfo";
import { Conclusion } from "./Conclusion";
import { Footer } from "./Footer";
import { Newsletter } from "./Newsletter";
import { PageInfo } from "./PageInfo";

export interface PostLayoutProps {
  readonly post: Post;
  readonly children: ReactNode;
}

/**
 * Bespoke `Bespoke -> Bespoke` organism composing the pack's molecules
 * (Task 005) — `AuthorInfo`, `PageInfo`, `ArticleProse`, `Conclusion`,
 * `Newsletter`, `AdsSpace` — plus `Footer` around a Post's body content.
 * Owns layout/ordering only; each molecule owns its own rendering.
 */
export function PostLayout({ post, children }: PostLayoutProps) {
  return (
    <div className="flex flex-col gap-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <AuthorInfo name="Ernest Bednarczyk" title="Author" fallback="EB" />
        <PageInfo formattedDate={post.formattedDate} readingTimeMinutes={post.readingTimeMinutes} />
        <ArticleProse post={post}>{children}</ArticleProse>
        <AdsSpace />
        <Conclusion
          heading="Thanks for reading"
          body="If this was useful, more like it are on the way."
          ctaLabel="Back to the blog"
          ctaHref="/blog"
        />
        <Newsletter heading="Get new posts by email" />
      </div>
      <Footer />
    </div>
  );
}
