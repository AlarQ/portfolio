import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { IdentityRail } from "@/components/ds/IdentityRail";
import { PostCard } from "@/components/ds/PostCard";
import type { NavItem } from "@/data/navItems";
import type { Post } from "@/data/posts";
import { ownerProfile } from "@/data/profile";

export interface AuthorProps {
  readonly posts: readonly Post[];
  /**
   * Injected nav for the `Header` — supplied by the caller (the `/author`
   * route passes the real `navItems`, stories pass a fixture) so this page
   * never depends on `src/stories/` and stays route-wireable, mirroring
   * `pages/Home`'s contract.
   */
  readonly navItems: readonly NavItem[];
  readonly activeHref?: string;
}

/**
 * `Pages/Author` screen: a split layout — sticky identity rail (portrait,
 * gallery thumbnails, name/title) beside a scrolling column of About, the
 * profile's `experienceAreas`, and the Posts list. Identity and all copy are
 * sourced from `src/data/profile.ts` — never hardcoded here (FR-6). Owns
 * layout/ordering only; each organism owns its own rendering.
 */
export function Author({ posts, navItems, activeHref }: AuthorProps) {
  return (
    <div className="flex min-h-dvh flex-col gap-10">
      <Header items={navItems} activeHref={activeHref} />
      <div className="mx-auto flex w-full max-w-content flex-1 flex-col gap-10 px-6 py-12 md:flex-row">
        <IdentityRail
          portrait={{ src: ownerProfile.imageSrc, alt: ownerProfile.imageAlt }}
          galleryPhotos={ownerProfile.galleryPhotos}
          name={ownerProfile.name}
          title={ownerProfile.title}
          subtitle={ownerProfile.subtitle}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">About</h2>
            <p className="leading-relaxed text-muted-foreground">{ownerProfile.bio}</p>
          </section>
          {ownerProfile.experienceAreas.map((area) => (
            <section key={area.heading} className="flex flex-col gap-3 border-t border-border pt-8">
              <h2 className="text-lg font-semibold text-foreground">{area.heading}</h2>
              <p className="leading-relaxed text-muted-foreground">{area.body}</p>
              <ul className="flex flex-wrap gap-2">
                {area.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="rounded-pill border border-border bg-muted px-3 py-1 text-xs text-secondary-foreground"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section className="flex flex-col gap-6 border-t border-border pt-8">
            <h2 className="text-lg font-semibold text-foreground">Posts</h2>
            <div className="grid gap-6">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
