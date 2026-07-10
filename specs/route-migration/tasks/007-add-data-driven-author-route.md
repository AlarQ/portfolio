---
id: "007"
name: Add data-driven /author route
status: todo
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
