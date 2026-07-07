import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Post } from "@/data/posts";

export interface PostCardProps {
  readonly post: Post;
}

/**
 * Bespoke molecule composing the shadcn `Card`/`Badge` primitives to present
 * a blog Post's headline, dek, and metadata. Binds only to semantic Tailwind
 * classes — no raw hex/palette lookups (`no-direct-palette-import`).
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="block no-underline">
      <Card className="transition-colors hover:border-primary">
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>{post.dek}</CardDescription>
        </CardHeader>
        <CardContent>
          <time dateTime={post.date} className="text-sm text-muted-foreground">
            {post.formattedDate}
          </time>
        </CardContent>
        <CardFooter>
          <Badge variant="secondary">{post.readingTimeMinutes} min read</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
