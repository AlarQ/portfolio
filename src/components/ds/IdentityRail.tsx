import Image from "next/image";
import type { GalleryPhoto } from "@/data/profile";

export interface IdentityRailProps {
  readonly portrait: { readonly src: string; readonly alt: string };
  readonly galleryPhotos: readonly GalleryPhoto[];
  readonly name: string;
  readonly title: string;
  readonly subtitle: string;
}

/**
 * A gallery slot: the real image when `src` exists, otherwise a labeled
 * placeholder tile so photo slots can ship before their files do.
 * Dark-mode note: `--muted` has no `semanticDark` override (stays light), so
 * placeholder text pairs with `text-secondary-foreground` (theme-stable),
 * never `text-foreground`. Once the dark surface tokens land it can move to
 * `text-muted-foreground`.
 */
function GalleryImage({ photo }: { readonly photo: GalleryPhoto }) {
  if (photo.src) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 768px) 33vw, 6rem"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted p-2 text-center text-xs text-secondary-foreground">
      {photo.alt}
    </div>
  );
}

/**
 * `Organisms/IdentityRail`: the sticky identity column on `/author` — portrait,
 * a 3-col gallery of thumbnails, and name/title. All data is **injected via
 * props** (never reads `src/data/profile.ts`) so the placeholder-vs-real
 * gallery states are exercisable in isolation in Storybook, mirroring the
 * page-nav-injection contract. Owns its own rendering; binds only semantic
 * tokens.
 *
 * Intentionally NOT `ds/AuthorInfo` (the inline byline molecule: shadcn
 * `Avatar` + name/title, used by `PostLayout`/`SinglePost`) — different job. A
 * byline needs a small circular avatar with an initials fallback; this rail
 * wants a full-bleed portrait + gallery and no fallback. Two distinct
 * molecules, not an accidental duplicate.
 *
 * Heading note: the name is an `<h1>` on the assumption that the rail owns the
 * page's top heading. That holds on `/author` because its `Header` is passed no
 * `title` (so `Header` emits no masthead `<h1>`), making this the sole `<h1>`.
 * A future page that composes both this rail AND a titled `Header` would get
 * two `<h1>`s — lift the heading level to a prop then.
 */
export function IdentityRail({
  portrait,
  galleryPhotos,
  name,
  title,
  subtitle,
}: IdentityRailProps) {
  return (
    <aside
      data-slot="identity-rail"
      className="flex flex-col gap-4 md:sticky md:top-8 md:h-fit md:w-72 md:shrink-0"
    >
      <div className="relative h-80 overflow-hidden rounded-2xl">
        <Image
          src={portrait.src}
          alt={portrait.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 18rem"
          className="object-cover"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {galleryPhotos.map((photo) => (
          <div key={photo.alt} className="aspect-square overflow-hidden rounded-lg">
            <GalleryImage photo={photo} />
          </div>
        ))}
      </div>
      <h1 className="text-2xl font-bold text-foreground">{name}</h1>
      <p className="text-xs font-medium tracking-widest text-muted-foreground">
        {title} · {subtitle}
      </p>
    </aside>
  );
}
