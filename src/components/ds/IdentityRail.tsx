import Image from "next/image";

export interface IdentityRailProps {
  readonly portrait: { readonly src: string; readonly alt: string };
  readonly name: string;
  readonly title: string;
  readonly subtitle: string;
}

/**
 * `Organisms/IdentityRail`: the sticky identity column on `/author` — portrait
 * and name/title. All data is **injected via props** (never reads
 * `src/data/profile.ts`), mirroring the page-nav-injection contract. Owns its
 * own rendering; binds only semantic tokens.
 *
 * Intentionally NOT `ds/AuthorInfo` (the inline byline molecule: shadcn
 * `Avatar` + name/title, used by `PostLayout`/`SinglePost`) — different job. A
 * byline needs a small circular avatar with an initials fallback; this rail
 * wants a full-bleed portrait and no fallback. Two distinct molecules, not an
 * accidental duplicate.
 *
 * Heading note: the name is an `<h1>` on the assumption that the rail owns the
 * page's top heading. That holds on `/author` because its `Header` is passed no
 * `title` (so `Header` emits no masthead `<h1>`), making this the sole `<h1>`.
 * A future page that composes both this rail AND a titled `Header` would get
 * two `<h1>`s — lift the heading level to a prop then.
 */
export function IdentityRail({ portrait, name, title, subtitle }: IdentityRailProps) {
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
      <h1 className="text-2xl font-bold text-foreground">{name}</h1>
      <p className="text-xs font-medium tracking-widest text-muted-foreground">
        {title} · {subtitle}
      </p>
    </aside>
  );
}
