# Roadmap

Status as of 2026-06-20. Goal: take the portfolio from its current **blog-only**
surface to a **blog-first portfolio MVP** - the **Blog is the front door** (`/`),
with a relocated **About** page and a **Projects** section - then layer post-MVP
enhancements.

This file is product/delivery planning. Domain language lives in
[`CONTEXT.md`](CONTEXT.md); architectural decisions in [`docs/adr/`](docs/adr).

---

## Information architecture (DECIDED 2026-06-20)

The site pivots from "home + projects + blog + CV" to **blog-first**:

- **Blog is the main page.** The blog index renders directly at **`/`**. Individual
  Posts keep their **`/blog/[slug]`** namespace (no SEO churn on the live Post, no slug
  collisions with `/about` etc.). Bare **`/blog` 308-redirects to `/`**; `/blog/[slug]`
  is untouched.
- **The old (hidden) home page becomes `/about`.** Relocated **verbatim** for the MVP -
  `HeroContent` + `TopicSection` + `ReadingSection`. Improving it is a **separate,
  later** task (see Post-MVP), with a north star of **author credibility for blog
  readers**: a dev who liked a Post clicks About to answer "who is this, why trust them"
  - favouring a tighter human intro + selected evidence over the full
  skills/achievements wall.
- **CV is dropped entirely.** No nav/hero CV link, and `public/cv/*.pdf` is deleted.
  The old Workstream D is struck.
- **Projects is kept but deprioritized.** The routed master-detail section (below) still
  ships, but *after* the blog-front-door + About relocation land. It is a nav tab from
  day one.
- **Nav** = **Blog** (`/`), **Projects** (`/projects`), **About** (`/about`). The
  logo/home click lands on `/` (the blog).

### File shuffle this implies
`src/app/blog/page.tsx` → moves to `src/app/page.tsx`; the current
`src/app/page.tsx` (home) → moves to `src/app/about/page.tsx`. The `/` → `/blog`
redirect in `next.config.ts` is removed and replaced by a single `/blog` → `/` rule.

---

## Where we are today

- The site is **blog-only by deliberate redirect**: `next.config.ts` sends `/` → `/blog`
  (307, temporary). The full home page (`src/app/page.tsx`) is built but shadowed/unreachable.
- **Home-page data is real and launch-ready** - profile, reading (`books.ts`), current
  topic (`topic.ts`), experience, skills, and domain areas are all genuine content. This
  content moves wholesale to `/about`.
- **Projects are fake placeholder data** (`src/data/projects.ts`): "E-Commerce Platform",
  "Task Management App", etc., with dead `*-demo.github.io` links. This is the only fake
  content on the site.
- **No `/projects` route exists.** `navItems.ts` exposes only `/blog`.
- **SEO is unconfigured**: metadata is still the `create-next-app` default; no sitemap,
  robots, OG image, or analytics. (The blog-first IA makes this easier - the canonical
  home is now real content, not a redirect.)
- Build/host target is **Vercel** (per `next.config.ts` comments). No domain configured.
- One real Post is live: `content/posts/my-spec-driven-workflow.mdx`.

---

## Domain-model changes (this roadmap drives these)

Captured in `CONTEXT.md`:

- **Money Planner is deprecated** - absorbed into Hyperion. Delete it entirely.
- **Projects link only to on-site content.** No external repo / live-demo / GitHub Pages
  links. The old external-link/embed approach is removed.
- New term **Project Brief**: an owner-authored, on-site MDX description page for a
  Project, rendered at `/projects/[slug]`. Distinct from a **Post**.
- A **Project** now has exactly one **Brief** and references **zero or more related Posts**,
  surfaced on its card as labeled links (Project→Post; never the reverse).

> **UX shape - routed master-detail (decided 2026-06-20):** The Projects tab is a
> **persistent left rail (project list) + right panel (the selected Project's Brief)**,
> like a docs site. Selection is driven by **routing**, not client state: `/projects/[slug]`
> statically renders the rail plus that Project's Brief on the right. This replaces the old
> hidden design, whose right panel **iframed an external GitHub Pages site** (`src={githubUrl}`,
> `sandbox`) - directly contradicting the new "no external embed, on-site Brief only" rule.
> The layout survives; the iframe mechanism is removed. Right-panel body becomes the Brief
> MDX rendered through the **same hardened seam** as Posts. Deep-linkable, SSG, shareable.

> **Security note (carries the MDX trust boundary):** Project Briefs are MDX rendered as
> trusted content, exactly like Posts. The "100% owner-authored" assumption in `CLAUDE.md`
> now extends to `content/projects/`. The new project loader MUST reuse the same single
> slug-validation gate (`^[a-z0-9-]+$`, skip + warn) and the same presentation seam
> (`mdxPresentation.tsx`) as the blog. Do not introduce a second, unhardened MDX path.

---

## MVP - blog-first launch

Definition of done: `ernest's domain` serves the **blog at `/`**, an **`/about`** page,
a **`/projects`** section backed by real work, and individual Posts - with correct link
previews and basic analytics. **No CV anywhere.**

### Workstream A - Blog-first IA (new immediate critical path)
Mechanical and fast; lands ahead of all content work.
- [ ] Move `src/app/blog/page.tsx` → `src/app/page.tsx` (blog index now renders at `/`).
- [ ] Move the current `src/app/page.tsx` (home) → `src/app/about/page.tsx`, **verbatim**
      (`HeroContent` + `TopicSection` + `ReadingSection`). Delete the "UNREACHABLE" banner
      comment once it actually serves.
- [ ] In `next.config.ts`: remove the `/` → `/blog` redirect; add `/blog` → `/` (308).
      Verify `/blog/[slug]` still resolves (the rule matches `/blog` exactly).
- [ ] Update `navItems.ts` to expose **Blog (`/`), Projects (`/projects`), About (`/about`)**.
- [ ] Verify the blog index, a Post, and `/about` all render; logo/home → `/`.

### Workstream B - Real projects (deprioritized; ships after A)
Routed master-detail (see UX-shape note above). Salvage + rewire the *hidden* subsystem;
do not rebuild from scratch and do not delete the layout. The iframe is what dies, not the
panel.

- [ ] **Salvage/rewire chrome:** keep `ProjectSidebar` (left rail), `ProjectDetailPanel`
      (right-panel header/frame), `ProjectCard` visual shell, and `mvpProgressTone`. Replace
      the iframe body with the rendered Brief MDX (`<BriefBody />`). Drop the iframe-only
      machinery - `sidebar/ProjectPreview`, `EmptyState`, `ErrorState` (load/error states
      exist only to manage an iframe; with no iframe there is nothing to manage). Strip
      `ProjectCard`'s `onClick`/`isExpanded` expand props if rail selection is a `<Link>`.
- [ ] **Revise the `Project` model:** remove `githubUrl`; add `slug` (Brief route) and
      `relatedPostSlugs: string[]` (0..N); keep `mvpProgress`. Remove the runtime
      `isValidProject` guard and unused query helpers (`getProjectsByProgress`,
      `getProjectsSortedByProgress`) - projects are owner-authored, so fail fast at build
      like the Post loader, not defensively at runtime.
- [ ] **Build the project loader mirroring `posts.ts` + `postLoader.ts`:** thin impure rind
      (readdir `content/projects/`, read files) → pure `buildProjectSet` core owning the
      single slug gate, frontmatter parse, `mvpProgress` range check, and `relatedPostSlugs`
      shape. **Related-Post links resolve against the live Post set at build (injected as an
      explicit dependency): unresolved slugs are dropped from the rendered labels with a
      skip+warn** (DECIDED 2026-06-20) - mirrors the slug-gate warn, honors "labels appear as
      Posts land." **Brief frontmatter is the source of truth** for title/dek/`mvpProgress`/
      `relatedPostSlugs`; one content home per Project. (DECIDED 2026-06-20.)
      *Note:* slug gate + frontmatter parse + ordering are common with `buildPostSet`; prefer
      extracting a shared MDX-frontmatter core over a copy-paste second loader, with per-type
      field validation (`date` for Posts; `mvpProgress`/`relatedPostSlugs` for Projects).
- [ ] Delete fake projects + Money Planner.
- [ ] Add **Hyperion** and **Bondsmith** as real Project Briefs.
- [ ] Build `/projects/[slug]/page.tsx` - `generateStaticParams` over project slugs,
      `dynamicParams = false`, dynamic-import the Brief MDX, render in the right panel; left
      rail lists all Projects; related-Post label links (Project→Post). Reuses the blog's
      hardened loader/seam - no second MDX path, no iframe, no external `src` (see security note).
- [ ] **Bare `/projects`** 308-redirects to the first Project's slug; **left rail ordered by
      `mvpProgress` descending** (most-mature first) (DECIDED 2026-06-20). Always lands on real
      content; slug pages are the indexable URLs.
- [ ] **Mobile reflow** - same page, CSS-responsive: the left rail becomes a horizontal
      chip/scroll selector **above** the Brief on narrow screens; redirect-to-first holds on
      all viewports; tapping a chip navigates to its slug (DECIDED 2026-06-20). No separate
      list screen, no back-link loop.

### Workstream C - Launch content
- [ ] Write the **Hyperion** Brief (`content/projects/hyperion.mdx`).
- [ ] Write the **Bondsmith** Brief (`content/projects/bondsmith.mdx`).
- [ ] Write **≥1 technical deep-dive Post** (target: Hyperion) and wire it as a related Post.
      *Link capability ships regardless; cards show labels only as Posts land.*

### Workstream D - Launch readiness
- [ ] Real metadata (title, description, `metadataBase`) replacing the create-next-app default.
- [ ] OpenGraph / Twitter card image (`opengraph-image`) so shared links render properly.
- [ ] `sitemap.ts` + `robots.ts` (canonical home is `/` - real content, not a redirect).
- [ ] **Vercel Analytics** (native, privacy-friendly).
- [ ] Branded custom 404 + light UX polish pass.

### Workstream E - Ship
- [ ] Deploy to Vercel; point the **custom domain** at it (see Dependencies).
- [ ] Verify build (`pnpm build`, `type-check`, `lint`) and chromium e2e are green.
      Watch for e2e specs asserting the old `/` → `/blog` redirect or a Blog-only nav.

### Critical path & sequencing
**Workstream A (blog-first IA) is the new immediate path** - small, mechanical, ships
first and unblocks a coherent public surface. Domain procurement (E) runs **in parallel**
with all build work - soft-launch on `*.vercel.app` if the domain isn't ready. The slowest
item remains **C (prose)**: Briefs + the first deep-dive. Projects (B) is deprioritized
behind A but still required for MVP done.

---

## Post-MVP backlog (ordered)

1. **Improve `/about`** - redesign the relocated page toward its north star: *author
   credibility for blog readers*. Tighten the dense recruiter-shaped hero (stats,
   Leadership/Technical columns, skills grids) into a human intro + selected evidence;
   keep Topic/Reading as a light "now" signal. North star set 2026-06-20; design TBD.
2. **Remaining deep-dive Posts** - Bondsmith technical article + further Hyperion pieces;
   each wires into its project's `relatedPostSlugs`.
3. **GitHub contribution graph** - PRD exists at `features/PRD-github-contributions.md`.
   Server-fetched (GraphQL), 6h ISR, needs a `GITHUB_TOKEN` env secret on Vercel.
4. **More projects** - the budget app and other Hyperion-consuming apps as they mature.
5. **Richer project cards** - screenshots and tech-stack tags (model extension).
6. **Analytics review** - once traffic exists, decide whether to add Plausible/funnels.

---

## Dependencies & open risks

- **Domain ownership (OPEN)** - Vercel + custom domain requires a domain you own. Confirm
  whether it's already purchased or still to buy; it gates the custom-domain launch (not
  the `*.vercel.app` soft launch).
- **e2e baseline** - known pre-existing webkit/mobile failures (profile-card h1 mismatch);
  chromium is the reliable signal. Don't let the new routes regress chromium. **The IA move
  (A) likely breaks any e2e asserting the `/`→`/blog` redirect or single-item nav - update
  those specs.**
- **MDX trust boundary** - must extend cleanly to `content/projects/` via the existing
  single slug gate + presentation seam (see security note above).
</content>
</invoke>
