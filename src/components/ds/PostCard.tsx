import { ArrowUpRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { BadgeCategory } from "@/components/ui/badgeVariants";
import type { Post } from "@/data/posts";

export interface PostCardCategory {
  readonly label: string;
  readonly category: BadgeCategory;
}

export interface PostCardProps {
  readonly post: Post;
  readonly coverImageUrl?: string;
  readonly categories?: readonly PostCardCategory[];
}

/**
 * Bespoke molecule presenting a blog Post's cover image, headline, dek, and
 * category badges to match the Figma "Blog post card" spec. Binds only to
 * semantic Tailwind classes - no raw hex/palette lookups
 * (`no-direct-palette-import`). `coverImageUrl`/`categories` are optional
 * presentation-only props layered on top of `Post` - the Post data model
 * itself carries neither field.
 */
export function PostCard({ post, coverImageUrl, categories }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="block no-underline">
      <article className="flex w-full flex-col gap-8">
        {coverImageUrl && (
          <div className="relative h-60 w-full shrink-0 overflow-hidden rounded-md">
            <Image src={coverImageUrl} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="flex w-full flex-col gap-6">
          <div className="flex w-full flex-col gap-3">
            <time dateTime={post.date} className="text-sm font-semibold text-primary">
              {post.formattedDate}
            </time>
            <div className="flex w-full items-start gap-4">
              <h3 className="flex-1 text-2xl leading-8 font-semibold text-foreground">
                {post.title}
              </h3>
              <span className="shrink-0 pt-1">
                <ArrowUpRightIcon className="size-6 text-foreground" />
              </span>
            </div>
            <p className="w-full text-base leading-6 text-muted-foreground">{post.dek}</p>
          </div>
          {categories && categories.length > 0 && (
            <div className="flex w-full flex-wrap items-start gap-2">
              {categories.map((c) => (
                <Badge key={c.label} category={c.category}>
                  {c.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
