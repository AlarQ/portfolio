import type { ReactNode } from "react";
import type { PostCardCategory } from "@/components/ds/PostCard";
import { Badge } from "@/components/ui/badge";
import { navItems as defaultNavItems, type NavItem } from "@/data/navItems";
import type { PostAdjacency } from "@/data/postLoader";
import type { Post } from "@/data/posts";
import type { TocEntry } from "@/data/postToc";
import { ArticleProse } from "./ArticleProse";
import { AuthorInfo } from "./AuthorInfo";
import { Conclusion } from "./Conclusion";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Newsletter } from "./Newsletter";
import { PageInfo } from "./PageInfo";
import { PrevNextNav } from "./PrevNextNav";
import { TableOfContents } from "./TableOfContents";

export interface PostLayoutProps {
  readonly post: Post;
  readonly children: ReactNode;
  readonly toc?: readonly TocEntry[];
  readonly adjacency?: PostAdjacency;
  readonly coverImageUrl?: string;
  readonly coverImageAlt?: string;
  readonly categories?: readonly PostCardCategory[];
  /**
   * Injected nav for the `Header` (mirrors `pages/Home`'s `HomeProps.navItems`
   * seam) — defaults to the real site-wide `navItems` so existing callers/tests
   * need not supply it, while routes and stories can still pass a fixture.
   */
  readonly navItems?: readonly NavItem[];
}

/**
 * Bespoke `Bespoke -> Bespoke` organism composing the pack's molecules
 * (Task 005) — `Header`, `AuthorInfo`, `PageInfo`, `ArticleProse` (with hero),
 * `TableOfContents`, category `Badge` row, `PrevNextNav`, `Conclusion`,
 * `Newsletter` — plus `Footer` around a Post's body content, aligned to the
 * Figma "Blog – Detail Blog" frame. Owns layout/ordering only; each molecule
 * owns its own rendering.
 *
 * `Header` renders here (not in the root layout) so each top-level page owns
 * exactly one nav instance — mirroring `pages/Home`, which renders its own
 * `Header` for the masthead. `activeHref="/"` is hardcoded rather than derived
 * from the real pathname: every Post detail route belongs to the single Blog
 * nav section (`navItems`'s one entry, now pointed at `/` per the inverted IA,
 * ADR-RM-4), so the caller doesn't need pathname plumbing to mark it active.
 */
export function PostLayout({
  post,
  children,
  toc,
  adjacency,
  coverImageUrl,
  coverImageAlt,
  categories,
  navItems = defaultNavItems,
}: PostLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col gap-10">
      <Header items={navItems} activeHref="/" />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <AuthorInfo name="Ernest Bednarczyk" title="Author" fallback="EB" />
        <PageInfo formattedDate={post.formattedDate} readingTimeMinutes={post.readingTimeMinutes} />
        {toc && toc.length > 0 ? <TableOfContents entries={toc} /> : null}
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
        <PrevNextNav prev={adjacency?.prev} next={adjacency?.next} />
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
