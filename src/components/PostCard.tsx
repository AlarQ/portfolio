"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import type { Post } from "@/data/posts";
import { brand } from "@/theme/theme";

export interface PostCardProps {
  readonly post: Post;
  readonly featured?: boolean;
  readonly testid: string;
}

export function PostCard({ post, featured = false, testid }: PostCardProps) {
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
