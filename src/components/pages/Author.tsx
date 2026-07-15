import { DomainAreaPanel } from "@/components/ds/DomainAreaPanel";
import { Footer } from "@/components/ds/Footer";
import { Header } from "@/components/ds/Header";
import { IdentityRail } from "@/components/ds/IdentityRail";
import { PostCard } from "@/components/ds/PostCard";
import { domainAreas } from "@/data/domains";
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
 * owner's Domain Areas (each a `DomainAreaPanel` — offering headline,
 * Achievements, rated Skills), and the Posts list. Identity/bio come from
 * `src/data/profile.ts`; the Domain Areas from `src/data/domains.ts` — never
 * hardcoded here (FR-6). Owns layout/ordering only; each organism owns its own
 * rendering.
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
            {ownerProfile.bio.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>
          {domainAreas.map((area) => (
            <DomainAreaPanel key={area.id} domain={area} />
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
