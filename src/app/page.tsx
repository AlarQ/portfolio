import { Home } from "@/components/pages/Home";
import { navItems } from "@/data/navItems";
import { getPosts } from "@/data/posts";

/**
 * The Blog index (ADR-RM-4: inverted IA — the blog lives at `/`, `/blog`
 * 308-redirects here via `next.config.ts`). Server component: reads the
 * single Post source (`getPosts`, newest-first) and hands it to `pages/Home`.
 */
export default function IndexPage() {
  const posts = getPosts();

  return <Home posts={posts} navItems={navItems} activeHref="/" />;
}
