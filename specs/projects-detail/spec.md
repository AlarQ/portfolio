# Spec - Expanded Project view: `/projects` index + `/projects/[slug]`

_Feature: `projects-detail` · tier: large · track: feature_

Written from the wayfinder map [Map: expanded /projects - media, captions, and a per-Project Roadmap](https://github.com/AlarQ/portfolio/issues/95) as its final ticket, [Write the expanded /projects spec from the map's decisions](https://github.com/AlarQ/portfolio/issues/107). **Every FR traces to a closed map ticket (cited inline as `[#NN]`); this spec introduces no new decisions.** Where a later ticket amended an earlier one, the amendment wins and is the version stated here.

## Overview

Today `/projects` is one client page: a `ProjectTabStrip` swaps an inline `ProjectSummary` + Brief per Project. This feature replaces it with an **index** at `/projects` (one `ProjectCard` per Project) and a per-Project **detail route** `/projects/[slug]` that stacks, in one column: **header → Capabilities → Roadmap → Brief** `[#99, #106]`.

- A **Capability** is a user-facing claim about what a Project lets you do, optionally evidenced by one media item (a silent clip or a still). Media renders as caption-led alternating rows above the Brief `[#96, #100]`.
- A **Roadmap** is one authored-name **Milestone** plus an ordered list of **Features** (`status`, `phase`); **Milestone Progress** is derived, never authored `[#98]`. Rendered as a single ordered list with a horizontal Milestone divider `[#102, #105]`.
- Clips live on **Vercel Blob** behind one base-URL constant; posters/stills are committed to `public/` `[#97, #101]`.
- Structured data is TypeScript, one module per Project under `src/data/projects/<slug>.ts`; MDX under `content/projects/` stays the Brief body only `[#101]`.

Non-negotiables inherited from `CLAUDE.md`: seam pattern (`src/data` → `*Presentation` → components), Storybook-first (no story, no route usage), semantic tokens only, `buildProjectSet` stays the single slug-validation gate, MDX trust boundary unchanged. Static SSG; no client state on the `/projects` tree except the media toggle `[#99, #104]`.

Glossary terms per `CONTEXT.md`: **Project**, **Project Brief**, **Project summary**, **Repo**, **Tech stack**, **Roadmap**, **Milestone**, **Feature**, **Milestone Progress**, **Post**; and new in this feature: **Capability** (FR-13).

## Functional Requirements

### FR-1: Per-Project data modules `[#101]`
`src/data/projects.ts` is replaced by a directory: `src/data/projects/<slug>.ts` (one module per Project) and `src/data/projects/index.ts` (types + the assembled `projects` array, hand-ordered from the per-Project imports). Array order stays authoritative - no `order` field, no alphabetical sort. Splitting by concept (e.g. `projectRoadmaps.ts` keyed by slug) is forbidden - that is the parallel-array shape `domains.ts` exists to prevent. `getProjects()` keeps its contract (validated + Brief-having set). No JSX, colours, icons, or URL literals in `src/data`.

**Data:** `Project`, `Capability`, `CapabilityMedia`, `Roadmap`, `Feature`
**Scenarios:** array-order-authoritative

### FR-2: `Project` gains `capabilities` and `roadmap` `[#98, #100, #101, #104]`
`Project` is extended in place: `capabilities: readonly Capability[]` (**required, may be empty** - present-but-empty is a data state, nothing branches on `undefined`) and `roadmap: Roadmap` (**required**). `Capability.media` is optional and is the single place "no media" is expressed. Media items are authored as **bare filenames** (`clip`, `poster`, `still`); URL assembly happens in the presentation seam (FR-4). Field shapes in [Data Model](#data-model).

**Data:** `Project`, `Capability`
**Scenarios:** text-only-capability-row, still-only-project

### FR-3: Milestone Progress derivation in `src/data` `[#98, #101, #105]`
`src/data` exports a pure derivation over a `Roadmap` returning `{ milestoneName, toward, beyond, progress, shippedToward, totalToward }` where `progress = shipped toward / total toward` (`beyond` excluded from both sides; 0 `toward` Features → 0). Grouping by `phase` preserves authored array order within each group. Components receive pre-grouped Features and never group, sort or compute themselves. No colour/icon/JSX here.

**Data:** `Roadmap`, `Feature`
**Scenarios:** progress-derived, progress-ignores-beyond, progress-100-visible

### FR-4: Presentation seam additions `[#97, #101, #105]`
`src/utils/projectPresentation.tsx` gains exactly:
- `Record<FeatureStatus, StatusTone>` (exhaustive; missing entry = compile error): `shipped → success`, `in-progress → info`, `planned → muted`, reusing the existing `status-dot` atom / `StatusTone` union. `phase` gets **no** hue.
- Media URL resolution: `clip` filename → `${mediaBaseUrl}/${project.slug}/${clip}`; `poster`/`still` → `/media/${project.slug}/${name}` under `public/`. `mediaBaseUrl` is **one build-time constant** (in `siteConfig.ts` or a sibling config module - not in `src/data/projects/*`), env-overridable, falling back to a local `public/media` path when unset. Swapping Vercel Blob → R2 → `public/` is a one-line change.
- Nothing else about the Roadmap passes through the seam; the divider label and `milestoneName` are rendered directly by the component.

**Data:** `FeatureStatus`, `CapabilityMedia`
**Scenarios:** status-tone-exhaustive, media-base-url-swap

### FR-5: Loader authoring warnings `[#101, #104, #105]`
`projectLoader.ts` gains warn-and-continue checks in the `isSlugValid` style (never drop the Project, except where the existing Brief gate already does):
1. **Clip cap** - > 5 clips summed across a Project's Capabilities → warn. Stills uncapped.
2. **Media filename pattern** - a filename gate mirroring `isSlugValid` (`^[a-z0-9-]+\.(mp4|webm|webp)$` or stricter); an invalid name is never joined to a path; `.gif` is rejected outright.
3. **Poster/still existence** under `public/media/<slug>/` - existence check on one known candidate, never a directory scan; missing → warn, Project stays.
4. **`beyond` never empty** - a Roadmap with zero `beyond` Features → warn.
5. **Missing `description` on a clip** → warn.
6. **Missing/empty `alt` on a still** → warn (unless the item records `alt: ""` as a deliberate ornamental decision).
7. **Animated WebP** - detected via the `ANIM` chunk in the RIFF header (header-only, no decoder) → warn.
16:9 aspect is an authoring rule, documented, not loader-checked.

**Scenarios:** clip-cap-warning, media-filename-rejected, missing-poster-warns-not-drops, empty-beyond-warning, missing-description-warning, gif-rejected

### FR-6: `/projects/[slug]` detail route `[#99]`
New `src/app/projects/[slug]/page.tsx` mirroring `blog/[slug]`: `dynamicParams = false`; `generateStaticParams` **maps** `getProjects()` (already validated + Brief-having) and re-validates nothing; `notFound()` as belt-and-braces; `generateMetadata` sets `<title>` = Project title, description = tagline; **site-default OG image** (no per-Project OG). **No back link** (parity with `/blog/[slug]`; Header carries `/projects`). Renders `pages/ProjectDetail`: `ProjectSummary` (header) → `CapabilitiesSection` → `RoadmapSection` → Brief (existing MDX pipeline via `mdxPresentation.tsx`, unchanged). A Brief stays **mandatory** for a Project to publish. Order: header → Capabilities → Roadmap → Brief `[#106]`; no switcher, no client state.

**Scenarios:** detail-route-renders, detail-order, missing-brief-no-route, slug-traversal-blocked

### FR-7: `/projects` index `[#99, #102]`
`/projects` becomes a pure-SSG index: reworded intro paragraph (FR-14) + one `ds/ProjectCard` per Project in array order. A card carries **title, tagline, tech Badges (per Repo, as today), Milestone Progress as a light inline figure, and a link** to `/projects/[slug]`. No poster thumbnails, no meter bar. The inline figure reads `NN% to <Milestone>`; at 100% it reads as a state word (e.g. `Launched`) rather than `100% to MVP`. `ProjectTabStrip`, `tab-pill`'s tablist consumers, and the client `pages/Projects` screen (with stories/tests) are **deleted**; `ProjectSummary` splits into `ds/ProjectCard` (index) and `ProjectSummary` (detail header block, minus Brief) - two components, not one with a `variant` prop.

**Scenarios:** index-cards, index-light-figure, index-100-state, tab-strip-gone

### FR-8: Detail header + Milestone Progress meter `[#98, #102, #105, #106]`
`ProjectSummary` (header block) renders title, tagline, tech Badges per Repo, related Posts, and **the only meter on the page**: `ui/meter` as **one inline row** - bar + `NN% to <Milestone>` + a real underlined **Roadmap ↓** jump link to `#roadmap`. Legend text is a **required prop** (never hardcodes "first usable release" / "MVP"). At 100%: same meter, same legend, no special state. `meter.tsx` doc comment updated MVP Progress → Milestone Progress. Meter fill stays `bg-primary`.

**Scenarios:** header-meter-jump-link, progress-100-visible, meter-legend-required

### FR-9: Capabilities section - layout `[#96, #100, #102, #104]`
`ds/CapabilitiesSection`: `<section aria-labelledby="capabilities-heading">` with an `<h2>` eyebrow (heavier weight than today's section labels), containing a `<ul>`, one `<li>` per Capability. Each media-bearing row: Capability text (`<p>`, never `<figcaption>`) + media frame, **DOM order caption-then-figure always**; alternating sides at `md:` via `flex-row-reverse` on the row (never per-child `order`); below `md:` stacks caption → media. Caption top-aligned to the frame. Frame ≈ half `max-w-content` and ≤ ~200px tall at desktop; inter-row gap (~40px) exceeds caption↔media gap so pairs group. A Capability **without media** renders as a compact full-width one-liner - never an empty alternating slot, never an empty `<figure>`. Section not rendered when `capabilities` is empty (no empty state). Stills carry no sub-caption; clips show poster + play state, never a bare duration.

**Scenarios:** rows-alternate, dom-order-caption-first, text-only-capability-row, no-capabilities-no-section

### FR-10: Media frame + accessibility contract `[#104]`
Normative, no latitude:
- **Frame**: `aspect-video`, `border border-border rounded-* overflow-hidden bg-muted`, media `width={1280} height={720}`, `object-fit: contain`. Media never brings its own border/shadow. Semantic tokens only.
- **Poster is a real `next/image` `<img>`** (first row `priority`, others lazy); `<video>` is **mounted only when playback is requested** (observer or toggle) - a never-played row fetches zero video bytes. `<video>` attrs: `muted playsinline disablePictureInPicture disableRemotePlayback preload="none"`; `loop` set as a DOM property in an effect (absent under reduced motion); `muted` set as DOM property immediately before every `play()`; `play()` rejection returns the toggle to Play state. No `<track>`. `aria-label={media.label}` on the `<video>` (never `aria-labelledby` to Capability prose).
- **`<figure>` wraps only the media frame**; `<figcaption>` = `media.description` (the SC 1.2.1 alternative), rendered visibly beneath the frame.
- **Toggle**: own-built button (not native `controls`), always rendered (never hover-only), **mounted after hydration only** (`mounted` flag; absent from SSG HTML so no-JS shows poster + caption with no dead control), absolutely positioned inset `bottom-3 left-3` so its `ring-[3px]` is not clipped, **44×44 CSS px**, opaque **token-backed** background (new semantic overlay token in `tokens.ts` → `pnpm generate:tokens`; `bg-black/50` forbidden), name `Play <label>` / `Pause <label>` (fallback `Play clip N of M`), no `aria-pressed`, no `aria-live`, no `aria-describedby`; paused state shows a filled play triangle; `aria-busy="true"` while loading, not disabled. Frame itself is not clickable. `Escape` does nothing.
- **Playback policy**: IntersectionObserver over all rows; only the **highest-ratio visible row not hand-paused** plays; every other row paused. Pause is per-row and **sticky** for the component instance (observer never resumes a hand-paused row; not persisted to storage). `visibilitychange`: pause on hidden, resume on visible only if not hand-paused. bfcache restore is safe by the same gate (asserted in e2e).
- **Reduced motion**: read client-side via `useSyncExternalStore` over `matchMedia('(prefers-reduced-motion: reduce)')`, server snapshot `true`; never alters server markup. Under `reduce`: no autoplay, no `loop`; explicit Play plays once, stops on last frame, label returns to `Play` (never `Replay`, never disabled). Layout unchanged.
- **Stills**: identical frame minus toggle, `next/image` with authored `alt`; must be static (`.gif` rejected, animated WebP warned).
- **Dependency recorded**: SC 2.4.11 holds because `Header.tsx` is not sticky.

**Scenarios:** one-clip-at-a-time, sticky-pause, reduced-motion-play-once, no-js-no-dead-control, zero-video-bytes-until-play, toggle-name-and-size, still-has-alt, dark-frame-border

### FR-11: Roadmap section `[#98, #102, #105, #106]`
`ds/RoadmapSection` with heading `id="roadmap"` (`<h2>`, eyebrow `ROADMAP`; legend line under the heading on mobile). Layout **A**: one ordered list in authored order - `toward` Features, then a horizontal Milestone divider labelled `<Milestone> · <shipped> of <total> shipped` (optional success-tone divider at 100%), a muted `After <Milestone>` caption, then `beyond` Features. Each row: `status-dot` (tone from FR-4) + Feature name; the status word lives in the row's **accessible name** (e.g. `sr-only` text), no visible per-row status text. **No second meter here.** No two-column/board layouts. Component receives pre-grouped Features (FR-3) and renders `milestoneName` directly.

**Scenarios:** roadmap-single-list-divider, roadmap-status-accessible-name, empty-beyond-warning

### FR-12: Media hosting + authoring budget `[#97]`
Clips are uploaded to **Vercel Blob** (public), addressed via `mediaBaseUrl` (FR-4). Documented escape hatches: Cloudflare R2, or `public/media/`. Per clip: ≤ 12 s seamless loop, **no audio track**, ≤ 1280×720, H.264 High + `-movflags +faststart` (optional AV1/WebM first `<source>`), ≤ 2 MB (hard ceiling 3 MB), 30 fps. Poster/still: WebP, 16:9, ≤ 80 KB, committed under `public/media/<slug>/`. e2e and Storybook assert against posters/stills only - **never** a network clip fetch. Streaming platforms and `<iframe>` players are rejected (MDX trust boundary untouched, no CSP decision forced).

**Scenarios:** media-base-url-swap, e2e-no-clip-fetch

### FR-13: Glossary + docs `[#98, #100, #104]`
`CONTEXT.md`: add **Capability** ("a user-facing claim about what a Project lets you do, 2-3 sentences, optionally evidenced by one media item"; _Avoid_: caption, feature) with its media's `label`, `description` and still `alt` defined in the same entry; update **Project summary** to the index-card shape of FR-7 (tab strip gone; carries Milestone Progress figure and a link to the Brief); Relationships: Project → zero or more Capabilities; Capability → at most one media item. Commit the pending `#98` glossary edits (Roadmap/Milestone/Feature/Milestone Progress) alongside. `CLAUDE.md` Notes: mention `src/data/projects/` layout and the media base-URL constant.

### FR-14: `/projects` intro copy (authoring, carried from the map's fog) `[#99]`
Replace the current paragraph ("…I'll share more detail in upcoming posts.") - its promise is now delivered by the detail route. Copy:

> Projects I'm building right now - what each one lets you do, how far it is toward its next milestone, and how it's built. Open a project for the full brief.

`e2e/` blog/projects specs that assert the old sentence are updated in the same commit.

### FR-15: Storybook + tests
Every new/changed `ui/`/`ds/`/`pages/` component ships a sibling story before route wiring: `ProjectCard` (short/long tagline, 0%/50%/100%), `ProjectSummary` (meter row, no related Posts), `CapabilitiesSection` (clip rows, still rows, text-only row, mixed, empty), `MediaFrame`/`ClipRow` (poster, playing, hand-paused, reduced-motion, loading), `RoadmapSection` (Bondsmith 8-Feature, 100% Hyperion, many-`beyond`), `pages/ProjectDetail`, `pages/Projects` (index). Fixtures under `src/components/storybook-fixtures/`, page-agnostic. Delete `ProjectTabStrip*` stories/tests. Existing e2e (`e2e/projects*.spec.ts`) rewritten for index + detail; add scenarios listed below.

## Data Model

```ts
export type FeatureStatus = "shipped" | "in-progress" | "planned";
export type FeaturePhase = "toward" | "beyond";

export interface Feature {
  readonly name: string;
  readonly status: FeatureStatus;
  readonly phase: FeaturePhase;
}

export interface Roadmap {
  readonly milestoneName: string;         // authored per Project: "MVP", "Maturity"
  readonly features: readonly Feature[];  // authored order is authoritative
}

export type CapabilityMedia =
  | { readonly kind: "clip"; readonly clip: string; readonly poster: string;
      readonly label: string; readonly description: string }
  | { readonly kind: "still"; readonly still: string; readonly alt: string;
      readonly label?: string };

export interface Capability {
  readonly text: string;            // 2-3 sentences, a claim true without the media
  readonly media?: CapabilityMedia; // absent = text-only one-liner row
}

export interface Project {
  readonly title: string;
  readonly slug: string;
  readonly tagline: string;
  readonly repos: readonly ProjectRepo[];
  readonly relatedPosts: readonly RelatedPostRef[];
  readonly capabilities: readonly Capability[]; // required, may be empty
  readonly roadmap: Roadmap;                     // required
}
```

Derived (never stored): `MilestoneProgress = { milestoneName, toward: Feature[], beyond: Feature[], shippedToward, totalToward, progress /* 0..1 */ }`.

**Constraints:** slug `^[a-z0-9-]+$` (existing gate); ≤ 5 clips per Project (warn); filenames bare, pattern-gated, never joined unvalidated; `beyond` non-empty (warn); clip needs `description`; still needs `alt`; no dates, no `current` flag, no `order` field, no URL literals in `src/data`.

## Scenarios

**array-order-authoritative** - Given `index.ts` orders `[hyperion, bondsmith]`, When `/projects` renders, Then cards appear in that order and `getProjects()` returns that order.

**progress-derived** - Given a Roadmap with 3 shipped of 6 `toward` Features, Then the derivation returns `progress = 0.5`, `shippedToward = 3`, `totalToward = 6`.

**progress-ignores-beyond** - Given a shipped `beyond` Feature is added, Then `progress` is unchanged.

**progress-100-visible** - Given all `toward` Features shipped, When the detail header renders, Then the meter still renders with legend `100% to <Milestone>` and no special state.

**status-tone-exhaustive** - Given a new `FeatureStatus` member without a seam entry, Then `pnpm type-check` fails.

**media-base-url-swap** - Given `mediaBaseUrl` changed to a local path, When the page renders, Then every clip `src` resolves under it and no other file changes.

**clip-cap-warning** - Given a Project with 6 clips, When the build runs, Then a warning is emitted and the Project still publishes.

**media-filename-rejected** - Given `clip: "../x.mp4"` or `still: "a.gif"`, When the loader runs, Then it warns and never joins the name to a path.

**missing-poster-warns-not-drops** - Given a poster missing under `public/media/<slug>/`, Then a warning is emitted and the Project remains published.

**empty-beyond-warning** - Given a Roadmap with no `beyond` Features, Then a build warning is emitted.

**missing-description-warning** - Given a clip with no `description`, Then a build warning is emitted.

**gif-rejected** - Given a still with `.gif`, Then the loader rejects it with a warning.

**detail-route-renders** - Given a valid Brief-having slug, When `/projects/[slug]` loads, Then `<title>` is the Project title and header, Capabilities, Roadmap, Brief render in that order.

**detail-order** - Given a detail page, Then DOM order is header → `#capabilities-heading` section → `#roadmap` section → Brief prose.

**missing-brief-no-route** - Given a Project without `content/projects/<slug>.mdx`, Then no detail route is generated and no index card is rendered.

**index-cards** - Given `/projects`, Then each Project renders as a `ProjectCard` linking to its detail route, with no meter bar and no poster.

**index-light-figure** - Given Bondsmith at 50%, Then its card title row shows `50% to MVP`.

**index-100-state** - Given Hyperion at 100%, Then its card shows a state word rather than `100% to Maturity`.

**tab-strip-gone** - Given the repo, Then no `ProjectTabStrip` module, story or `role="tablist"` remains on `/projects`.

**header-meter-jump-link** - Given the detail header, When the visitor activates **Roadmap ↓**, Then focus/scroll lands on `#roadmap`.

**meter-legend-required** - Given `ui/meter` rendered without legend text, Then it is a type error.

**rows-alternate** - Given 3 media rows at ≥ `md:`, Then media sides alternate via `flex-row-reverse`; below `md:` every row stacks caption then media.

**dom-order-caption-first** - Given any media row, Then the Capability `<p>` precedes the `<figure>` in DOM regardless of visual side.

**text-only-capability-row** - Given a Capability with no `media`, Then it renders as a full-width one-liner with no `<figure>` and no empty slot.

**still-only-project** - Given Hyperion (stills only), Then rows render frames with `<img alt>` and no toggle.

**no-capabilities-no-section** - Given `capabilities: []`, Then no Capabilities section or heading renders.

**one-clip-at-a-time** - Given two clip rows both ≥ 50% visible, Then only the higher-ratio row plays.

**sticky-pause** - Given a visitor pauses a row, When it scrolls out and back (and after a bfcache restore), Then it does not resume.

**reduced-motion-play-once** - Given `prefers-reduced-motion: reduce`, Then nothing autoplays; Play plays once, stops on the last frame, label returns to `Play`.

**no-js-no-dead-control** - Given JS disabled, Then poster + caption render and no toggle button exists in the HTML.

**zero-video-bytes-until-play** - Given a row never played, Then no `<video>` element is mounted and no `.mp4` request is made.

**toggle-name-and-size** - Given a mounted toggle, Then its accessible name is `Play <label>`, it is ≥ 44×44 CSS px, has an opaque token background, and its focus ring is not clipped.

**still-has-alt** - Given a still row, Then `<img>` carries the authored `alt` distinct from the Capability text.

**dark-frame-border** - Given dark theme, Then the frame renders `border-border` + `bg-muted` regardless of media colour.

**roadmap-single-list-divider** - Given Bondsmith's Roadmap, Then one list renders `toward` rows, a divider `MVP · 3 of 6 shipped`, an `After MVP` caption, then `beyond` rows; no second meter.

**roadmap-status-accessible-name** - Given a Feature row, Then its accessible name includes the status word and no visible status text is shown.

**e2e-no-clip-fetch** - Given the e2e suite, Then no test depends on a network fetch of a clip.

## Security Scenarios

_Static SSG; slug set from `src/data/projects/index.ts` via the unchanged `buildProjectSet` gate. Media adds a filename → path join and an external asset origin._

**slug-traversal-blocked** - Given a slug with path characters, Then `buildProjectSet` rejects it before any join; `generateStaticParams` maps only the validated set.

**media-filename-traversal-blocked** - Given `poster: "../../secret.webp"`, Then the filename gate rejects it and no `existsSync`/`join` runs on it (Tampering).

**no-iframe-no-third-party-js** - Given a clip row, Then it renders a native `<video>` from `mediaBaseUrl` only; no iframe, no player SDK; MDX neutralizers unchanged (trust boundary holds).

**mdx-script-neutralized / external-link-hardened** - unchanged from `specs/projects-tab/spec.md` for the Brief body.

## User Flow

```mermaid
sequenceDiagram
    actor Visitor
    participant Index as /projects (ProjectCard×N)
    participant Detail as /projects/[slug]
    participant Caps as CapabilitiesSection
    participant Road as RoadmapSection (#roadmap)
    Visitor->>Index: open
    Index-->>Visitor: cards: title, tagline, badges, "50% to MVP", link
    Visitor->>Detail: click card
    Detail-->>Visitor: header (meter row + Roadmap ↓) → Capabilities → Roadmap → Brief
    Visitor->>Caps: scroll; observer plays highest-ratio clip
    Visitor->>Caps: press Pause (sticky per row)
    Visitor->>Road: activate Roadmap ↓ jump link
    Road-->>Visitor: list + "MVP · 3 of 6 shipped" divider
```

## Applicable Ground Rules

- `frontend/accessibility.md`
- `frontend/components.md`
- `frontend/design-tokens.md`
- `frontend/styling.md`
- `languages/nextjs/app-router.md`
- `languages/nextjs/server-vs-client.md`
- `languages/typescript/patterns.md`
- `languages/typescript/type-safety.md`
- `security/input-validation.md`
- `testing/structure.md`
- `testing/test-quality.md`

## Traceability

| Ticket | FRs |
|---|---|
| [#96](https://github.com/AlarQ/portfolio/issues/96) media shape | FR-9, FR-10 |
| [#97](https://github.com/AlarQ/portfolio/issues/97) hosting | FR-4, FR-12 |
| [#98](https://github.com/AlarQ/portfolio/issues/98) Roadmap model | FR-2, FR-3, FR-8, FR-11, FR-13 |
| [#99](https://github.com/AlarQ/portfolio/issues/99) route split | FR-6, FR-7, FR-14 |
| [#100](https://github.com/AlarQ/portfolio/issues/100) Capability | FR-2, FR-9, FR-13 |
| [#101](https://github.com/AlarQ/portfolio/issues/101) authoring shape | FR-1, FR-2, FR-4, FR-5 |
| [#102](https://github.com/AlarQ/portfolio/issues/102) prototype | FR-7, FR-8, FR-9, FR-11 |
| [#104](https://github.com/AlarQ/portfolio/issues/104) a11y contract | FR-5, FR-10, FR-13 |
| [#105](https://github.com/AlarQ/portfolio/issues/105) Roadmap rendering | FR-3, FR-4, FR-5, FR-11 |
| [#106](https://github.com/AlarQ/portfolio/issues/106) coexistence | FR-6, FR-8 |
