import Image from "next/image";
import type { ReactNode } from "react";
import type { Post } from "@/data/posts";

export interface ArticleProseProps {
  readonly post: Post;
  readonly children: ReactNode;
  readonly coverImageUrl?: string;
  readonly coverImageAlt?: string;
}

/**
 * Bespoke organism for a Post's title + body prose. `children` is Post body
 * content already rendered through the single MDX -> presentation seam
 * (`mdxComponents`, `src/utils/mdxPresentation.tsx` via the App Router
 * `useMDXComponents` hook) — this component never parses MDX/HTML itself and
 * defines no MDX component overrides of its own (FR-11, sec-mdx-seam-untouched).
 * It only supplies the `Display lg` heading, an optional Figma-ratio hero image,
 * and a semantic `<article>` wrapper that carries prose typography for the body.
 */
export function ArticleProse({ post, children, coverImageUrl, coverImageAlt }: ArticleProseProps) {
  return (
    <article className="flex flex-col gap-8">
      <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {post.title}
      </h1>
      {coverImageUrl ? (
        <div className="relative aspect-[778/426] w-full overflow-hidden rounded-2xl">
          <Image src={coverImageUrl} alt={coverImageAlt ?? ""} fill className="object-cover" />
        </div>
      ) : null}
      <div className="flex flex-col gap-6 text-lg leading-relaxed text-muted-foreground [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-foreground [&>figure]:flex [&>figure]:flex-col [&>figure]:gap-2 [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground [&_img]:w-full [&_img]:rounded-2xl">
        {children}
      </div>
    </article>
  );
}
