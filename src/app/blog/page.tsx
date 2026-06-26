import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import { PostList } from "@/components/PostList";
import { getPosts } from "@/data/posts";
import { pageShellSx, pageTitleSx } from "@/theme/layout";

export const metadata: Metadata = { title: "Blog" };

/**
 * The `/blog` index. A server component: it reads the single Post source
 * (`getPosts`, which touches the filesystem) and hands the ordered set to the
 * presentational `PostList`. List and `/blog/[slug]` detail share this one
 * loader (FR-1), so the route set never drifts from what is listed.
 */
export default function BlogPage() {
  const posts = getPosts();

  return (
    <Container maxWidth="md" sx={pageShellSx}>
      <Typography variant="h1" sx={pageTitleSx}>
        Blog
      </Typography>

      <PostList posts={posts} />
    </Container>
  );
}
