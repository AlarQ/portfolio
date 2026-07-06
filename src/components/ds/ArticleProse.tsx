import type { ReactNode } from "react";
import type { Post } from "@/data/posts";

export interface ArticleProseProps {
  readonly post: Post;
  readonly children: ReactNode;
}

/**
 * Bespoke organism for a Post's title + body prose. `children` is Post body
 * content already rendered through the single MDX -> presentation seam
 * (`mdxComponents`, `src/utils/mdxPresentation.tsx` via the App Router
 * `useMDXComponents` hook) — this component never parses MDX/HTML itself and
 * defines no MDX component overrides of its own (FR-11, sec-mdx-seam-untouched).
 * It only supplies the title heading and a semantic `<article>` wrapper.
 */
export function ArticleProse({ post, children }: ArticleProseProps) {
  return (
    <article className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-foreground">{post.title}</h1>
      {children}
    </article>
  );
}
