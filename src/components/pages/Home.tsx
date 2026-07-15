import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { Newsletter } from "@/components/ds/Newsletter";
import { Pagination } from "@/components/ds/Pagination";
import { PostCard, type PostCardCategory } from "@/components/ds/PostCard";
import type { NavItem } from "@/data/navItems";
import { NEWSLETTER_ACTION } from "@/data/newsletter";
import type { Post } from "@/data/posts";
import { categoryPresentation } from "@/utils/categoryPresentation";

export interface HomeProps {
  readonly posts: readonly Post[];
  /**
   * Injected nav for the `Header` — supplied by the caller (stories pass the
   * Figma fixture, a future route passes the real `navItems`) so this page
   * never depends on `src/stories/` and stays route-wireable.
   */
  readonly navItems: readonly NavItem[];
  readonly activeHref?: string;
}

/** How many newest Posts fill the "Recent blog posts" featured cluster. */
const RECENT_COUNT = 4;

/**
 * Resolve a Post's vocabulary `categories` (`src/data/categories.ts`) into the
 * `PostCard` badge props via the `categoryPresentation` seam — the label is
 * the vocabulary name itself, the hue comes from the seam's exhaustive map.
 * Absent/empty `categories` yields `undefined` so `PostCard` no-renders the
 * badge row, per Acceptance #5.
 */
function toPostCardCategories(post: Post): readonly PostCardCategory[] | undefined {
  if (!post.categories || post.categories.length === 0) {
    return undefined;
  }
  return post.categories.map((name) => ({ label: name, category: categoryPresentation(name) }));
}

interface PostPartition {
  readonly recent: readonly Post[];
  readonly all: readonly Post[];
}

/**
 * Split the newest-first Post set disjointly into the "Recent blog posts"
 * featured cluster (first {@link RECENT_COUNT}) and the "All blog posts" grid
 * (the remainder), so every Post renders in exactly one section — keeping the
 * structural invariant `article count === posts.length`.
 */
function partitionPosts(posts: readonly Post[]): PostPartition {
  return { recent: posts.slice(0, RECENT_COUNT), all: posts.slice(RECENT_COUNT) };
}

/**
 * `Pages/Home` screen: the Figma-faithful blog index (node 614:383, the
 * blog-first front door). Composes the `ds/` organisms — `Header` masthead →
 * "Recent blog posts" featured cluster → "All blog posts" 3-column grid →
 * `Pagination` → `Newsletter` → `Footer`. Owns layout/ordering only; each
 * organism owns its own rendering.
 */
export function Home({ posts, navItems, activeHref = "/blog" }: HomeProps) {
  const { recent, all } = partitionPosts(posts);
  // No `?page=` routing this pack (OQ-6) — every Post renders on one page, so
  // there is exactly one page of results until a route owns real paging.
  const totalPages = posts.length > 0 ? 1 : 0;

  return (
    <div className="flex min-h-dvh flex-col gap-4 bg-background">
      <Header
        items={navItems}
        activeHref={activeHref}
        title="cold take"
        subtitle="slow thoughts on fast tech"
      />

      <div className="mx-auto flex w-full max-w-content flex-1 flex-col gap-16 px-6">
        {recent.length > 0 && (
          <section aria-labelledby="recent-heading" className="flex flex-col gap-8">
            <h2 id="recent-heading" className="sr-only">
              Recent blog posts
            </h2>
            {/* First post takes the full-height left column; the next two stack
                in the right column; a fourth spans the full width beneath.
                (PostCard's cover is a fixed height, so the tall track holds the
                card rather than stretching the cover — a known fidelity gap.) */}
            <div className="grid gap-6 md:grid-cols-2">
              {recent.map((post, index) => (
                <div
                  key={post.slug}
                  className={
                    index === 0 ? "md:row-span-2" : index === 3 ? "md:col-span-2" : undefined
                  }
                >
                  <PostCard
                    post={post}
                    coverImageUrl={post.coverImage}
                    categories={toPostCardCategories(post)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {all.length > 0 && (
          <section aria-labelledby="all-heading" className="flex flex-col gap-8">
            <h2 id="all-heading" className="text-2xl font-semibold text-foreground">
              All blog posts
            </h2>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {all.map((post) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  coverImageUrl={post.coverImage}
                  categories={toPostCardCategories(post)}
                />
              ))}
            </div>
          </section>
        )}

        {totalPages > 1 && <Pagination currentPage={1} totalPages={totalPages} />}

        <Newsletter
          heading="Get new posts by email"
          description="Tired of hot takes? Stick around for more thoughtful posts on tech and beyond."
          hint="We care about your data in our"
          privacyHref="/privacy"
          action={NEWSLETTER_ACTION}
        />
      </div>

      <Footer />
    </div>
  );
}
