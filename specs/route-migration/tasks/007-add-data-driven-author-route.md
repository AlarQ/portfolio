---
id: "007"
name: Add data-driven /author route
status: done
blocked_by: ["006"]
max_files: 7
ground_rules:
  - languages/nextjs/app-router.md
  - architecture/general.md
  - frontend/components.md
test_cases:
  - author_route_renders_profile_module_name_title
  - changing_profile_field_changes_rendered_page_no_hardcode
  - desktop_nav_and_mobile_menu_both_contain_author_link
estimated_files:
  - src/data/profile.ts
  - src/app/author/page.tsx
  - src/components/pages/Author.tsx
  - src/components/pages/Author.stories.tsx
  - src/data/navItems.ts
  - e2e/navigation.spec.ts
  - e2e/blog-nav.spec.ts
interaction: afk
implementer: engineering/frontend-developer
pr_url: https://github.com/AlarQ/portfolio/pull/74
---

## Objective
Ship `/author` rendering `pages/Author` with identity sourced from an extended `src/data/profile.ts` (replacing the composition's hardcode) and add the Author link to the Header nav (desktop + `#mobile-menu`).

## Implements
| Kind      | Ref |
|-----------|-----|
| FR        | FR-6 |
| Contract  | —   |
| Data      | —   |
| Scenarios | author-page-renders, author-nav-link |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | `src/data/profile.ts` holds the owner's identity (extended with any missing fields) | a reader visits `/author` | `pages/Author` renders name and title from the profile module — no hardcoded identity |
| 2 | any page | the Header renders | the nav (desktop and `#mobile-menu`) includes a link to `/author` |
| 3 | the pre-push gate | it runs | lint, type-check, vitest, audit green; `Author.stories.tsx` updated if props changed |

## Approach
- Extend `profile.ts` (data module — no JSX/color) with the fields `pages/Author` currently hardcodes; route composes, resolves nothing visual. Specifically: add an explicit `name` field to `OwnerProfile` — today the human name lives only in `imageAlt` ("Ernest Bednarczyk"); do NOT repurpose `imageAlt` as the display name (identity must not leak through an alt-text field).
- Nav link is one `navItems.ts` edit consumed by `ds/Header`/`HeaderMobileMenu` (single-source nav per the existing module contract).

## Implementation Log

chunks_spawned: 1

**Interface choices**
- `OwnerProfile` (`src/data/profile.ts`) gains an explicit `name: string` field
  (value `"Ernest Bednarczyk"`). Kept distinct from `imageAlt` per the task's
  load-bearing constraint — identity is read from `name`, never leaked through
  the alt-text field. `title` reuses the existing `ownerProfile.title`
  (`"SOFTWARE ENGINEER"`), replacing the removed `title="Author"` literal.
- `pages/Author` now renders its own `ds/Header` (layout mounts no global nav —
  task 005), so `AuthorProps` gained `navItems: readonly NavItem[]` +
  `activeHref?: string`, mirroring `pages/Home`'s route-wireable contract. The
  identity hardcode `<AuthorInfo name="Ernest Bednarczyk" title="Author">` is
  replaced by `name={ownerProfile.name} title={ownerProfile.title}` (imported
  from the data module; `fallback="EB"` retained).
- New route `src/app/author/page.tsx`: server component reading `getPosts()` +
  `navItems`, composing `<Author>` with `activeHref="/author"` — mirrors
  `src/app/page.tsx`, resolves nothing visual.
- `src/data/navItems.ts`: single-source nav gains `{ href: "/author", label:
  "Author" }`; module doc updated. `ds/Header` desktop nav + `#header-mobile-menu`
  drawer both consume it, no second hardcoded copy.

**Test coverage**
- `e2e/author.spec.ts` (new): `/author` renders name+title read from the profile
  module (data-driven, not asserting a literal).
- `src/components/pages/Author.test.tsx`: added no-hardcode guard asserting
  rendered text contains `ownerProfile.name` and `ownerProfile.title`
  (`title` assertion is the load-bearing de-hardcode proof).
- `e2e/navigation.spec.ts`: additive Author-link assertions — desktop
  `getByRole("link", {name:"Author"})` + drawer `#header-mobile-menu
  a[href="/author"]`. Task-006 aria/open-close/backdrop assertions untouched.

**Backlog deviations**
- `estimated_files` listed `e2e/blog-nav.spec.ts`; per Test Strategist it is the
  FR-3 prev/next suite, unrelated to the Author nav link — left unedited.
- The real drawer DOM id is `#header-mobile-menu`, not `#mobile-menu` as the
  task text said — assertions target the real id.
- Props change on `Author` also required updating the pre-existing
  `Pages.structure.test.tsx` render call (added `navItems`) to keep it green.

**Refactors applied**
- None beyond keeping `Author` aligned with `Home`'s Header contract; the diff
  is small and already at the right altitude.
- Pre-validation quality check (code-quality-pragmatist) raised one LOW finding
  (cq-001): `activeHref` had a `"/author"` default duplicating the route
  literal. Applied — `activeHref` is now optional with no default, exactly
  mirroring `pages/Home`'s contract; the route supplies the value explicitly.
  No high/critical findings.

**Continuity note**
- The delegated `frontend-developer` implementer terminated mid-slice on an
  account-wide session limit after landing profile/route/Author/stories +
  behavior-1 e2e. The remainder (behavior-2 unit guard, behavior-3 nav link +
  navItems entry, and the structure-test fixup) was completed inline on the
  same working tree, same TDD method. Full suite green afterward: type-check,
  biome lint, `lint:stories`, vitest (261 passed / 1 skipped), and the two
  affected e2e specs on chromium (11 passed).
