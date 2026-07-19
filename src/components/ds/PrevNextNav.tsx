import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { Post } from "@/data/posts";
import { cn } from "@/lib/utils";
import { READING_NAV_FOCUS_RING } from "./readingNav";

export interface PrevNextNavProps {
  readonly prev?: Post;
  readonly next?: Post;
}

/**
 * Footer navigation between chronologically adjacent Posts (FR-3). The `Post`
 * type carries no neighbour field, so the two neighbours arrive as explicit
 * optional props - the route resolves adjacency and hands down plain,
 * already-slug-validated `Post` data (single slug gate, CLAUDE.md).
 *
 * "Newer/Older" labelling (not "Previous/Next") is a presentation-only choice:
 * `prev` is the newer neighbour, `next` the older one. The `<nav>` accessible
 * name is exactly "Post navigation" - the contract `e2e/blog-nav.spec.ts`
 * asserts. Presentational and token-bound: semantic Tailwind utilities only,
 * no router hooks, matching the sibling `TableOfContents`.
 */
export function PrevNextNav({ prev, next }: PrevNextNavProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Post navigation"
      className="mt-12 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2"
    >
      {prev ? <NavLink post={prev} direction="newer" /> : <span />}
      {next ? <NavLink post={next} direction="older" /> : <span />}
    </nav>
  );
}

interface NavLinkProps {
  readonly post: Post;
  readonly direction: "newer" | "older";
}

function NavLink({ post, direction }: NavLinkProps) {
  const isNewer = direction === "newer";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col gap-1 rounded-md p-4 no-underline transition-colors hover:bg-muted",
        READING_NAV_FOCUS_RING,
        isNewer ? "sm:col-start-1" : "sm:col-start-2 sm:text-right"
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1.5 text-sm text-muted-foreground",
          !isNewer && "sm:flex-row-reverse"
        )}
      >
        {isNewer ? (
          <ArrowLeftIcon className="size-4" aria-hidden />
        ) : (
          <ArrowRightIcon className="size-4" aria-hidden />
        )}
        {isNewer ? "Newer post" : "Older post"}
      </span>
      <span className="font-bold text-foreground group-hover:text-primary">{post.title}</span>
    </Link>
  );
}
