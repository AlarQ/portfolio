import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { PostAdjacency } from "@/data/postLoader";
import type { Post } from "@/data/posts";
import { brand } from "@/theme/theme";

/**
 * Footer navigation between adjacent Posts (FR-3). Consumes `getAdjacentPosts`'s
 * output directly — `prev`/`next` already carry validated `Post.slug`s, so this
 * component draws no independent slug source and re-validates nothing (single
 * slug gate, CLAUDE.md). "Newer/Older" labeling (not "Previous/Next") is a
 * presentation-only choice: the data layer stays generic prev/next.
 */
export interface PostNavProps extends PostAdjacency {}

export function PostNav({ prev, next }: PostNavProps) {
  if (!prev && !next) return null;

  return (
    <Box
      component="nav"
      aria-label="Post navigation"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
        mt: 6,
        pt: 4,
        borderTop: `1px solid ${brand.borderSubtle}`,
      }}
    >
      {prev ? <NavLink post={prev} direction="newer" /> : <Box />}
      {next ? <NavLink post={next} direction="older" /> : <Box />}
    </Box>
  );
}

interface NavLinkProps {
  readonly post: Post;
  readonly direction: "newer" | "older";
}

function NavLink({ post, direction }: NavLinkProps) {
  const isNewer = direction === "newer";

  return (
    <Box
      component={Link}
      href={`/blog/${post.slug}`}
      sx={{
        display: "block",
        textDecoration: "none",
        gridColumn: isNewer ? "1" : { xs: "1", sm: "2" },
        textAlign: isNewer ? "left" : { xs: "left", sm: "right" },
        p: 2,
        borderRadius: 2,
        transition: "background-color 0.2s ease",
        "&:hover": { backgroundColor: brand.paperOverlay85 },
      }}
    >
      <Typography
        component="span"
        sx={{
          display: "block",
          color: brand.slate,
          fontSize: "0.875rem",
          mb: 0.5,
        }}
      >
        {isNewer ? "← Newer post" : "Older post →"}
      </Typography>
      <Typography component="span" sx={{ display: "block", color: brand.white, fontWeight: 700 }}>
        {post.title}
      </Typography>
    </Box>
  );
}
