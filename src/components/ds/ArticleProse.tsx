"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { Post } from "@/data/posts";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

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
 * `useMDXComponents` hook) - this component never parses MDX/HTML itself and
 * defines no MDX component overrides of its own (FR-11, sec-mdx-seam-untouched).
 * It only supplies the `Display lg` heading, an optional Figma-ratio hero image,
 * and a semantic `<article>` wrapper that carries prose typography for the body.
 *
 * `max-w-prose-measure` (task 005, typography-measure-constrained) pins the
 * `<article>`'s own reading measure to the `proseMeasure` token (64ch,
 * `src/theme/tokens.ts`) - the single declared source for the column width,
 * not an ad-hoc per-component literal.
 *
 * `data-reduced-motion` (reduced-motion-respected, FR-11) surfaces
 * `usePrefersReducedMotion()` deterministically on the article so the entrance
 * motion's suppression is testable independent of the animation's own settled
 * computed style (see e2e/blog.spec.ts). The hook starts `false` on the
 * server/first client render (hydration-safe) then flips on mount, so the
 * entrance keyframe still briefly plays once under `reduce` before the
 * attribute updates - the attribute, not a settled style sample, is the
 * deterministic contract here.
 */
export function ArticleProse({ post, children, coverImageUrl, coverImageAlt }: ArticleProseProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <article
      className="flex max-w-prose-measure flex-col gap-8 animate-article-entrance data-[reduced-motion=true]:animate-none"
      data-reduced-motion={String(prefersReducedMotion)}
    >
      <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {post.title}
      </h1>
      {coverImageUrl ? (
        <div className="relative aspect-[778/426] w-full overflow-hidden rounded-2xl">
          <Image src={coverImageUrl} alt={coverImageAlt ?? ""} fill className="object-cover" />
        </div>
      ) : null}
      <div className="flex flex-col gap-4 text-lg leading-relaxed text-muted-foreground [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:text-foreground [&>figure]:flex [&>figure]:flex-col [&>figure]:gap-2 [&_figcaption]:text-sm [&_figcaption]:text-muted-foreground [&_img]:w-full [&_img]:rounded-2xl">
        {children}
      </div>
    </article>
  );
}
