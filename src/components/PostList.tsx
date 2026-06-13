import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Post } from "@/data/posts";
import { brand } from "@/theme/theme";
import { PostCard } from "./PostCard";

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
