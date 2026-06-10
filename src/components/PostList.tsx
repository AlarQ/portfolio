"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { Post } from "@/data/posts";
import { brand } from "@/theme/theme";

export interface FeaturedLayout {
  readonly featured: Post | null;
  readonly rest: readonly Post[];
}

/**
 * Carve an already newest-first ordered Post set into a featured head and the
 * remaining tail, without reordering. The loader owns ordering
 * (`postLoader.ts`); this only decides which slot each Post fills. Total over
 * N: at N=0 `featured` is `null` (the index renders its empty state), at N=1
 * the lone Post is featured with an empty `rest` (no abandoned slot), and at
 * N≥2 the newest leads with the rest following in order.
 */
export function splitFeatured(posts: readonly Post[]): FeaturedLayout {
  const [featured = null, ...rest] = posts;
  return { featured, rest };
}

interface PostListProps {
  readonly posts: readonly Post[];
}

/**
 * The `/blog` index body: a featured-first list of Posts. Presentational — it
 * takes the Post set as a prop (the route reads the loader), so the ordering
 * invariant is unit-testable via `splitFeatured` without the filesystem.
 */
export function PostList({ posts }: PostListProps) {
  const { featured, rest } = splitFeatured(posts);

  if (!featured) {
    return (
      <Typography
        data-testid="blog-empty"
        sx={{ color: brand.slate, fontSize: "1rem", py: 6, textAlign: "center" }}
      >
        No posts yet — check back soon.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 3, md: 4 } }}>
      <PostCard post={featured} featured testid="featured-post" />
      {rest.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} testid="post-list-item" />
          ))}
        </Box>
      )}
    </Box>
  );
}

interface PostCardProps {
  readonly post: Post;
  readonly featured?: boolean;
  readonly testid: string;
}

function PostCard({ post, featured = false, testid }: PostCardProps) {
  return (
    <Box
      component={Link}
      href={`/blog/${post.slug}`}
      data-testid={testid}
      sx={{
        display: "block",
        textDecoration: "none",
        backgroundColor: brand.paperOverlay85,
        border: `1px solid ${brand.borderSubtle}`,
        borderRadius: 3,
        p: featured ? { xs: 3, md: 4 } : { xs: 2.5, md: 3 },
        transition: "border-color 0.2s ease, transform 0.2s ease",
        "&:hover": {
          borderColor: brand.sky,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Typography
        component={featured ? "h2" : "h3"}
        sx={{
          color: brand.white,
          fontWeight: 700,
          fontSize: featured ? { xs: "1.5rem", md: "2rem" } : { xs: "1.125rem", md: "1.25rem" },
          mb: 1,
        }}
      >
        {post.title}
      </Typography>

      <Typography sx={{ color: brand.slateLight, fontSize: "1rem", lineHeight: 1.6, mb: 1.5 }}>
        {post.dek}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: brand.slate,
          fontSize: "0.875rem",
        }}
      >
        <Typography component="time" dateTime={post.date} sx={{ fontSize: "inherit" }}>
          {post.formattedDate}
        </Typography>
        <Box component="span" aria-hidden sx={{ color: brand.slate }}>
          •
        </Box>
        <Typography component="span" sx={{ fontSize: "inherit" }}>
          {post.readingTimeMinutes} min read
        </Typography>
      </Box>
    </Box>
  );
}
