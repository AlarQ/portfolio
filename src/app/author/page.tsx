import { Author } from "@/components/pages/Author";
import { navItems } from "@/data/navItems";
import { getPosts } from "@/data/posts";

/**
 * The `/author` route (FR-6). Server component: reads the single Post source
 * (`getPosts`, newest-first) and the real `navItems`, then hands them to
 * `pages/Author`. Identity is resolved inside the page from `profile.ts`;
 * the route resolves nothing visual, mirroring `src/app/page.tsx`.
 */
export default function AuthorPage() {
  const posts = getPosts();

  return <Author posts={posts} navItems={navItems} activeHref="/author" />;
}
