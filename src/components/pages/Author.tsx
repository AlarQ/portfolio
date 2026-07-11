import { AuthorInfo } from "@/components/ds/AuthorInfo";
import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { PostCard } from "@/components/ds/PostCard";
import type { NavItem } from "@/data/navItems";
import type { Post } from "@/data/posts";
import { ownerProfile } from "@/data/profile";

export interface AuthorProps {
  readonly posts: readonly Post[];
  /**
   * Injected nav for the `Header` — supplied by the caller (the `/author`
   * route passes the real `navItems`, stories pass a fixture) so this page
   * never depends on `src/stories/` and stays route-wireable, mirroring
   * `pages/Home`'s contract.
   */
  readonly navItems: readonly NavItem[];
  readonly activeHref?: string;
}

/**
 * `Pages/Author` screen: composes the `ds/` organisms (`Header`, `AuthorInfo`,
 * `PostCard`, `Footer`) into an author profile listing their Posts. Identity
 * (`name`/`title`) is sourced from `src/data/profile.ts` — never hardcoded here
 * (FR-6). Owns layout/ordering only; each organism owns its own rendering.
 */
export function Author({ posts, navItems, activeHref }: AuthorProps) {
  return (
    <div className="flex min-h-dvh flex-col gap-10">
      <Header items={navItems} activeHref={activeHref} />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
        <AuthorInfo name={ownerProfile.name} title={ownerProfile.title} fallback="EB" />
        <h2 className="text-xl font-semibold text-foreground">Posts</h2>
        <div className="grid gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
