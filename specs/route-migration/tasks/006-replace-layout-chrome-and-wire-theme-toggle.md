---
id: "006"
name: Replace layout chrome + wire theme toggle
status: implemented
blocked_by: ["004", "005"]
max_files: 17
ground_rules:
  - languages/nextjs/server-vs-client.md
  - frontend/accessibility.md
  - frontend/styling.md
test_cases:
  - no_mui_provider_in_rendered_tree_on_any_route
  - themepill_toggles_dark_class_on_html_and_persists_across_reload
  - first_visit_renders_light
  - nav_aria_labels_and_mobile_menu_selector_green_on_ds_chrome
  - themepill_story_covers_light_active_and_dark_active_states
estimated_files:
  - src/app/layout.tsx
  - src/theme/ThemeProvider.tsx
  - src/theme/ThemeProvider.test.tsx
  - src/components/ds/ThemePill.tsx
  - src/components/ds/ThemePill.stories.tsx
  - src/components/ds/Header.tsx
  - src/components/ds/HeaderMobileMenu.tsx
  - src/components/navigation/Navigation.tsx
  - src/components/navigation/DesktopNav.tsx
  - src/components/navigation/MobileNav.tsx
  - src/components/navigation/NavLink.tsx
  - src/components/navigation/HamburgerButton.tsx
  - src/components/navigation/LogoTile.tsx
  - src/components/navigation/index.ts
  - src/utils/navPresentation.ts
  - src/utils/footerPresentation.tsx
  - e2e/navigation.spec.ts
interaction: afk
implementer: engineering/frontend-developer
pr_url: https://github.com/AlarQ/portfolio/pull/73
---

## Objective
Compose `ds/Header` + `ds/Footer` in the root layout, reduce `ThemeProvider` to next-themes only (MUI provider/CssBaseline/AppRouterCacheProvider unmounted), wire `ThemePill` to `setTheme`, and delete `navigation/*` — making the light-default, token-backed theme live site-wide.

## Implements
| Kind      | Ref |
|-----------|-----|
| FR        | FR-7 |
| Contract  | —   |
| Data      | —   |
| Scenarios | layout-chrome-replaced, theme-toggle-works, light-default |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | any route | the page renders | `ds/Header` and `ds/Footer` frame the content; no MUI/Emotion provider (`MuiThemeProvider`, `CssBaseline`, `AppRouterCacheProvider`) is mounted |
| 2 | a reader on any page | they activate the `ThemePill` | theme flips light↔dark via the `.dark` class mechanism and persists on reload |
| 3 | a first-time visitor with no stored preference | any page renders | light theme is active (existing `defaultTheme="light"`, `enableSystem={false}` preserved) |
| 4 | the existing nav e2e contracts | `navigation.spec.ts` runs (chromium) | aria labels and `#mobile-menu` are intact on the ds chrome |

## Approach
- `ThemeProvider.tsx` already mounts next-themes with light default — this task *removes* the MUI half, it does not add theming.
- `ThemePill` becomes the client-boundary toggle (`useTheme().setTheme`); client surface confined to it + the provider per design KB notes.
- Same-branch deletion of `navigation/*` (7 files) + `navPresentation.ts` per ADR-RM-5; `#mobile-menu` contract moves to `ds/HeaderMobileMenu`.
- Rewire/retire `footerLinks.ts`/`footerPresentation.tsx` against `ds/Footer`'s data needs (SF-1: if the footer rework turns non-trivial, spill that pair into 010 rather than growing this task).

## Implementation Log

chunks_spawned: 2

- Chunk 1: `layout.tsx` — removed `AppRouterCacheProvider`; `ThemeProvider.tsx` reduced to a thin `NextThemesProvider` wrapper only (`MuiThemeProvider`/`CssBaseline`/`theme.ts` import dropped, `defaultTheme="light"`/`enableSystem={false}` preserved); `ThemePill.tsx` made `"use client"` and wired to `useTheme().setTheme` via a real `<button aria-label="Toggle color theme">` (was a decorative `aria-hidden` span). Added `ThemeProvider.test.tsx` coverage for the dark toggle and `first_visit_renders_light`, plus `layout.test.ts`.
- Chunk 2: confirmed `navigation/*` (7 files) + `navPresentation.ts` were already deleted in task 005 (commit b56f1fb) and `e2e/navigation.spec.ts` already targets the ds chrome (`ds/Header`/`ds/HeaderMobileMenu`, `#header-mobile-menu`) — 8/8 green, no code change needed for backlog item 4. `footerPresentation.tsx`/`footerLinks.ts` were already ds-wired — no rework, no SF-1 deferral needed. Added `ThemePill.stories.tsx` `Light`/`Dark` stories using the existing per-story `globals: { theme }` pattern (mirrors `SinglePost.stories.tsx`), replacing the prior single manual-toolbar-flip story.
- Deviation: root-layout composition (`ds/Header`+`ds/Footer` in `layout.tsx` itself) was NOT changed — `pages/Home` and `ds/PostLayout` (used by `SinglePost`) each mount `Header`+`Footer` per-page, a decision already made in task 005 to avoid a strict-mode duplicate nav link. Every route is still framed by the ds chrome; `spec.md`'s `layout-chrome-replaced` scenario text does not literally require root-layout mounting. Kept as-is.
- Full suite green: type-check, lint, lint:stories, `vitest run` (260 passed, 1 skipped), `playwright --project=chromium` (46 passed; 1 pre-existing unrelated `feed.spec.ts` failure — missing `SITE_URL` env in this sandbox, reproduced on unmodified tree via `git stash`).
