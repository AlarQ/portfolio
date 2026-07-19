# Test Strategy - route-migration

> Produced by the Test Strategist agent at /propose time. Grounding fact: exactly one published Post exists - `prevnext-navigation`, newest-first ordering, and meaningful pagination assertions currently have no data to run against; that anchors the shared-fixture decision below.

**Overview:** Unit tests own boundary logic at the loader/seam level (tasks 001–003), chromium e2e owns route behavior per full-route pass (004–007), and build-output checks own the deletion/hygiene endgame (008–010, with 010 as sole verifier of terminal states). Every formerly multi-owned scenario is resolved to one primary owner; the other task keeps at most a supporting assertion at a *different* level, never a re-test of the owned logic.

## 1. Task Test Responsibilities

```yaml
- task_id: "001"
  task_name: rehome-shiki-palette-to-token-layer
  test_theme: "Prove the --shiki-* palette is sourced solely from the token layer while theme.ts still exists, and built code blocks resolve from it"
  owns:
    - "code-block-highlighted (build-output): built Post HTML code-block colors resolve from token-layer --shiki-* vars, dark island in both themes (OQ-2)"
    - "tokens.css freshness guard still green after regeneration (never-hand-edit invariant)"
    - "Precursor gate: repointed shikiVars.test.ts passes with theme.ts STILL PRESENT (overlap window, R-2) - this is the Given that differs from shiki-gate-green"
  must_not_test:
    - "shiki-gate-green (Given theme.ts is DELETED) - owned by 010; 001 cannot satisfy that Given"
    - "Route-level rendering of the migrated SinglePost - 004's surface"
  integration_seams:
    - "tokens.ts primitives → generate:tokens → tokens.css → built shiki HTML (build pipeline seam)"
  shared_fixtures:
    - "None created; relies on the existing Post's fenced code block"

- task_id: "002"
  task_name: extend-post-frontmatter-and-category-vocabulary
  test_theme: "Prove the loader's single validation gate correctly accepts, warns-and-drops, and never traverses - for coverImage, categories, and the unchanged slug gate"
  owns:
    - "unknown-category-omitted (unit): warning names the entry, entry omitted, Post publishes"
    - "sec-coverimage-path-validated (unit): external URL / protocol-relative / '..' → warn + drop, no fetch, no traversal"
    - "sec-slug-gate-unchanged (unit): existing slug-gate regression suite byte-for-byte green"
    - "Happy path: valid coverImage + known categories carried into the typed Post model (acceptance row 1)"
    - "categoryPresentation exhaustive-Record compile-error type test (ADR-RM-2)"
  must_not_test:
    - "How covers/badges RENDER on cards or pages - 005 owns rendering/degradation; 002 stops at the parsed model"
    - "Badge hue visual correctness in e2e - 005"
  integration_seams:
    - "categories.ts vocabulary → loader validation → categoryPresentation Record (data→seam contract, unit level)"
  shared_fixtures:
    - "CREATES the second published Post MDX (with valid coverImage, known categories, headings, a fenced code block, an external link) - the ≥2-posts fixture that 004 (prevnext), 005 (newest-first ordering, cover cards) and e2e suites depend on. Earliest task touching content/posts/, so creation lands here"

- task_id: "003"
  task_name: build-reading-ds-components-and-rewrite-mdx-seam
  test_theme: "Prove the rewritten MDX seam preserves the trust boundary verbatim and the new reading ds/ components honor existing a11y contracts - at unit/story level, before any route consumes them"
  owns:
    - "sec-script-neutralized, sec-iframe-neutralized, sec-external-link-rel (unit, at the seam - the one-file trust-boundary audit per ADR-RM-1)"
    - "mdx-body-token-styled (unit + ArticleProse story): token classes, zero sx, zero hex/rgb literals in seam output"
    - "ToC accessible-name unit test matching the existing e2e contract string (component-level contract lock)"
    - "PrevNextNav edge behavior (only-existing-neighbor) at unit level with fixture posts"
  must_not_test:
    - "Route-level ToC/anchors/prevnext behavior at /blog/[slug] - 004's e2e; 003 stays component-level"
    - "Anything requiring the app router or real loader data - stories stay page-agnostic per CLAUDE.md"
  integration_seams:
    - "mdxPresentation registry → ArticleProse slot (seam→ds contract: ArticleProse receives already-neutralized output and adds no trust logic)"
  shared_fixtures:
    - "CREATES page-agnostic fixture MDX/props in src/components/storybook-fixtures/ (headings, prose variety, neighbor posts) - reused by 004's SinglePost story and 005's Home/PostCard stories"

- task_id: "004"
  task_name: migrate-post-route-to-singlepost
  test_theme: "Prove the full /blog/[slug] vertical slice on the new surface: SSG, 404, reading affordances, and the trust boundary surviving composition - chromium e2e"
  owns:
    - "post-page-renders, unknown-slug-404 (e2e-chromium)"
    - "toc-contract-preserved, heading-anchors-preserved, prevnext-navigation (e2e-chromium - the route-level truth of 003's component contracts)"
    - "blog-security.spec.ts green post-migration (route-level regression of the seam neutralizers - different level than 003's unit ownership, unmodified in intent)"
    - "Token-resolution restatement of blog-mdx-mapping/blog-highlighting for THIS route's specs (mechanism; final suite-wide verification is 010's)"
  must_not_test:
    - "Badge hue mapping, card/cover degradation logic - 005 owns cover-categories-render/absent; 004 asserts only presence of cover+badges inside its post-page-renders check"
    - "Seam neutralizer logic at unit level - 003 owns it; 004 only runs the e2e regression"
    - "Suite-wide zero-rgb-literal verification (e2e-token-assertions) - 010"
    - "code-block-highlighted ownership - 001; 004's shiki e2e check is the route-level restatement, not the scenario owner"
  integration_seams:
    - "loader (002 fields) + MDX pipeline + ds reading components (003) → pages/SinglePost → route (the pack's biggest composition seam)"
    - "seam→ArticleProse→route: neutralizers still active in the real rendered page (blog-security e2e)"
    - "token-layer shiki vars (001) → highlighted HTML on the MIGRATED surface (blog-highlighting restated)"
  shared_fixtures:
    - "CREATES the shared e2e token-resolution assertion helper (computed style === resolved semantic-token CSS var, per OQ-5) under e2e/support/ - reused by 005, 006, 010. Earliest e2e task needing it"
    - "CONSUMES 002's second Post (prevnext) and 003's storybook fixtures (SinglePost story)"

- task_id: "005"
  task_name: invert-ia-home-index-with-blog-redirect
  test_theme: "Prove the IA inversion end-to-end: index content/ordering at /, 308 at /blog, RSS neutrality, pagination suppression, and card-level cover/category behavior"
  owns:
    - "home-index-renders (e2e-chromium - content + newest-first ordering; the 'light default' clause is 006's light-default per SF-4)"
    - "blog-redirects-home (e2e-chromium: literal 308 status assertion)"
    - "rss-urls-unchanged (e2e-chromium, feed.spec.ts)"
    - "pagination-hidden-single-page (e2e-chromium)"
    - "cover-categories-render AND cover-categories-absent (primary owner: PostCard unit + story states for degradation logic, index e2e for presence - the card is the shared component, so the logic is tested once, here)"
  must_not_test:
    - "Theme defaulting/toggling - 006 (light-default, theme-toggle-works)"
    - "Loader validation of coverImage/categories - 002; 005 consumes the parsed model"
    - "Post-page composition - 004"
  integration_seams:
    - "loader (002's new optional fields) → pages/Home → PostCard (fixture→loader swap type-safety made behavioral)"
    - "Redirect at the routing layer: next.config redirects() emitting 308 while /blog/[slug] and /feed.xml stay untouched (ADR-RM-4)"
  shared_fixtures:
    - "CONSUMES 002's second Post (ordering, cover/category card states) and 003's storybook fixtures; REUSES 004's e2e token helper (if 005 merges first, it creates the helper and 004 consumes - reassign explicitly at that point; default owner 004)"

- task_id: "006"
  task_name: replace-layout-chrome-and-wire-theme-toggle
  test_theme: "Prove site-wide chrome and theming: ds Header/Footer everywhere, no MUI provider mounted, ThemePill toggles .dark and persists, light by default"
  owns:
    - "layout-chrome-replaced (e2e-chromium: no MuiThemeProvider/CssBaseline/AppRouterCacheProvider in the tree, ds chrome frames every route)"
    - "theme-toggle-works (e2e-chromium: .dark class flip + persistence across reload)"
    - "light-default (e2e-chromium: first visit, no stored preference - includes the light-default clause SF-4 moved out of home-index-renders)"
    - "navigation.spec.ts aria + #mobile-menu contracts on the ds chrome"
    - "ThemePill story states (light-active/dark-active)"
  must_not_test:
    - "home-index-renders content/ordering - 005"
    - "Author nav link - 007 adds it after this task; 006 asserts the nav contract shape, not the author entry"
    - "Token variable resolution mechanics per element - use 004's shared helper, don't fork a second assertion style"
  integration_seams:
    - "ThemePill → next-themes setTheme → .dark class on <html> → semantic token re-resolution (assert one element's computed color changes to the semanticDark-resolved value via the shared helper)"
  shared_fixtures:
    - "CONSUMES 004's e2e token helper for the dark-mode resolution assertion"

- task_id: "007"
  task_name: add-data-driven-author-route
  test_theme: "Prove /author renders from the profile module (no hardcode) and the nav gains the author link in both menus"
  owns:
    - "author-page-renders (e2e-chromium + the no-hardcode unit check: change a profile field, rendered output changes)"
    - "author-nav-link (e2e-chromium: desktop nav AND #mobile-menu)"
  must_not_test:
    - "General nav aria/#mobile-menu contracts - 006 owns them; 007's navigation.spec.ts changes are ADDITIVE (author-link assertions only)"
    - "Header/Footer composition - 006"
  integration_seams:
    - "navItems.ts (data) → ds/Header + HeaderMobileMenu (006's chrome) - proves the single-source nav contract absorbs a new entry"
  shared_fixtures:
    - "None created; consumes existing profile.ts"

- task_id: "008"
  task_name: delete-orphaned-portfolio-components
  test_theme: "Prove deletion left no dangling references and the whole gate stays green - progress check, not a spec-scenario owner"
  owns:
    - "Zero spec scenarios (mui-gone is 010's). Owns: build + full unit suite + chromium green post-deletion; zero grep hits for deleted identifiers; @mui import count strictly decreased (R-1 monotonic check)"
  must_not_test:
    - "Final mui-gone verification (repo-wide zero + package.json) - 010"
    - "Anything about surviving routes' behavior - 004/005/006/007 e2e already cover them; rerun, don't add"
  integration_seams:
    - "None new - this is reachability-driven deletion (R-5)"
  shared_fixtures:
    - "None"

- task_id: "009"
  task_name: delete-orphaned-data-modules-and-seams
  test_theme: "Prove the data/seam unwind is complete and brand's consumer count is theme-internal-only, making 010 mechanical"
  owns:
    - "Zero spec scenarios. Owns: build/unit/chromium green after data+seam deletion; zero references to deleted modules; brand consumer count at/near zero with only theme/-internal survivors (the ADR-RM-5 gate condition for 010)"
  must_not_test:
    - "Final mui-gone / deps verification - 010"
  integration_seams:
    - "None new"
  shared_fixtures:
    - "None"

- task_id: "010"
  task_name: final-legacy-sweep-deps-preflight-docs
  test_theme: "Prove terminal states: legacy fully gone, deps clean and pinned, preflight on, shiki gate green without theme.ts, suite free of MUI-era literals, docs current"
  owns:
    - "mui-gone (build-output: repo-wide grep zero @mui/@emotion/framer-motion + build succeeds)"
    - "deps-removed-pins-exact (unit: depsPinned.test.ts) and sec-dep-removal-clean (build-output: npm-driven removal, lockfile consistent, npm audit green)"
    - "preflight-reenabled (build-output + chromium visual sanity on all four routes)"
    - "shiki-gate-green (unit: shikiVars.test.ts green with theme.ts ABSENT - the scenario's actual Given)"
    - "e2e-token-assertions (build-output: grep of e2e sources for MUI-era rgb literals = zero, suite green - final suite-wide verification; 004/005/006 did the per-route restatement)"
    - "docs-current (build-output-style check: no coexistence guidance in CLAUDE.md/CONTEXT.md)"
    - "Salvaged coexistence route-regression block: relocate into e2e/blog.spec.ts in the SAME commit that deletes coexistence.spec.ts"
  must_not_test:
    - "Component/route behavior beyond regression reruns - no new behavioral tests here; this task is verification of absence, not presence"
  integration_seams:
    - "Whole-system seam: build + unit + chromium green simultaneously with deps removed, preflight on, theme.ts gone (the three terminal changes interact - R-6)"
  shared_fixtures:
    - "CONSUMES 004's token helper for any surviving color assertions; relocates (does not rewrite) the salvaged route-regression block"
```

## 2. Spec Coverage Map

All 31 scenario ids in spec.md (25 functional + 6 security), each with exactly one owner:

```yaml
- { spec_scenario: home-index-renders,            owning_task: "005", test_type: e2e-chromium }   # light-default clause carved out to 006 per SF-4
- { spec_scenario: blog-redirects-home,           owning_task: "005", test_type: e2e-chromium }
- { spec_scenario: rss-urls-unchanged,            owning_task: "005", test_type: e2e-chromium }
- { spec_scenario: pagination-hidden-single-page, owning_task: "005", test_type: e2e-chromium }
- { spec_scenario: post-page-renders,             owning_task: "004", test_type: e2e-chromium }
- { spec_scenario: unknown-slug-404,              owning_task: "004", test_type: e2e-chromium }
- { spec_scenario: toc-contract-preserved,        owning_task: "004", test_type: e2e-chromium }   # 003's unit name-lock is supporting, different level
- { spec_scenario: prevnext-navigation,           owning_task: "004", test_type: e2e-chromium }   # needs 002's second Post
- { spec_scenario: heading-anchors-preserved,     owning_task: "004", test_type: e2e-chromium }
- { spec_scenario: mdx-body-token-styled,         owning_task: "003", test_type: unit }           # + ArticleProse story; 004 e2e restates per-route only
- { spec_scenario: code-block-highlighted,        owning_task: "001", test_type: build-output }   # 004's shiki e2e = route-level restatement, not owner
- { spec_scenario: shiki-gate-green,              owning_task: "010", test_type: unit }           # Given theme.ts DELETED - only satisfiable in 010
- { spec_scenario: cover-categories-render,       owning_task: "005", test_type: e2e-chromium }   # card logic tested once at PostCard; 004 asserts presence only
- { spec_scenario: cover-categories-absent,       owning_task: "005", test_type: unit }           # PostCard unit + story states
- { spec_scenario: unknown-category-omitted,      owning_task: "002", test_type: unit }
- { spec_scenario: author-page-renders,           owning_task: "007", test_type: e2e-chromium }
- { spec_scenario: author-nav-link,               owning_task: "007", test_type: e2e-chromium }
- { spec_scenario: layout-chrome-replaced,        owning_task: "006", test_type: e2e-chromium }
- { spec_scenario: theme-toggle-works,            owning_task: "006", test_type: e2e-chromium }
- { spec_scenario: light-default,                 owning_task: "006", test_type: e2e-chromium }
- { spec_scenario: mui-gone,                      owning_task: "010", test_type: build-output }   # 008/009 hold decrement checks only
- { spec_scenario: deps-removed-pins-exact,       owning_task: "010", test_type: unit }
- { spec_scenario: preflight-reenabled,           owning_task: "010", test_type: build-output }
- { spec_scenario: e2e-token-assertions,          owning_task: "010", test_type: build-output }   # final suite-wide zero-rgb grep; 004/005/006 restate per-route
- { spec_scenario: docs-current,                  owning_task: "010", test_type: build-output }
- { spec_scenario: sec-script-neutralized,        owning_task: "003", test_type: unit }           # 004's blog-security e2e = route regression, supporting
- { spec_scenario: sec-iframe-neutralized,        owning_task: "003", test_type: unit }
- { spec_scenario: sec-external-link-rel,         owning_task: "003", test_type: unit }
- { spec_scenario: sec-slug-gate-unchanged,       owning_task: "002", test_type: unit }
- { spec_scenario: sec-coverimage-path-validated, owning_task: "002", test_type: unit }
- { spec_scenario: sec-dep-removal-clean,         owning_task: "010", test_type: build-output }
```

Tasks 008 and 009 deliberately own zero spec scenarios - their test surface is regression-green + monotonic-decrement checks feeding 010's terminal verification.

## 3. Integration Test Plan

```yaml
- seam: "loader (002's coverImage/categories) + ds reading components (003) + MDX pipeline → pages/SinglePost → /blog/[slug] route"
  owning_task: "004"
  rationale: "The later task with full context of both the data extension and the components; the fixture→loader swap becomes behavioral here"

- seam: "mdxPresentation neutralizers → ArticleProse → live rendered route (trust boundary survives composition)"
  owning_task: "004"
  rationale: "003 proves the seam in isolation (unit, one-file audit per ADR-RM-1); only the route task can prove nothing between seam and page re-introduces trust logic - via blog-security.spec.ts kept green unmodified in intent"

- seam: "token-layer --shiki-* (001) → shiki build emission → highlighted HTML on the MIGRATED post surface"
  owning_task: "004"
  rationale: "001 proves sourcing at build-output on the pre-migration surface; 004 re-proves on the new surface when it restates blog-highlighting.spec.ts. Two levels, one owner each"

- seam: "loader → pages/Home → PostCard with optional cover/categories (newest-first ordering across ≥2 posts)"
  owning_task: "005"
  rationale: "Index route task composes the loader with the pack-1 Home; ordering only testable once 002's second Post exists"

- seam: "next.config redirects() 308 at the routing layer, with /blog/[slug] and /feed.xml unaffected (ADR-RM-4)"
  owning_task: "005"
  rationale: "Redirect, post-route reachability, and RSS neutrality must be asserted in the same pass - a wrong matcher pattern would break all three"

- seam: "ThemePill → next-themes → .dark on <html> → semantic token re-resolution in computed styles"
  owning_task: "006"
  rationale: "The only task where the toggle, the class mechanism, and token-backed dark are all live; use 004's shared token helper to assert an element's computed color equals the semanticDark-resolved var"

- seam: "navItems.ts → ds/Header + HeaderMobileMenu absorbing a new entry (desktop + #mobile-menu)"
  owning_task: "007"
  rationale: "Later task; 006 built the chrome, 007 proves the single-source nav contract holds for additions"

- seam: "Whole-system terminal state: deps removed + preflight on + theme.ts deleted, simultaneously green (build/unit/chromium)"
  owning_task: "010"
  rationale: "These three changes interact (R-2, R-6); only the sweep commit can verify their conjunction, including shikiVars.test.ts with theme.ts absent"
```

## 4. Risk Flags

```yaml
- description: "One-published-Post reality: prevnext-navigation, newest-first ordering, and cover-categories e2e have no data - content/posts/ has exactly one MDX file"
  severity: high
  mitigation: "002 creates a second published Post (valid coverImage, known categories, headings, code fence, external link) as a shared fixture; 004/005 declare consumption. Without this, 004's prevnext e2e and 005's ordering assertion silently degenerate to no-ops. Note: pagination-hidden-single-page still holds at 2 posts (one page)"

- description: "Five formerly multi-owned scenarios (code-block-highlighted, shiki-gate-green, cover-categories-render/absent, mui-gone, e2e-token-assertions, home-index-renders) would produce duplicated e2e assertions across 001/004, 004/005, 008/009/010, 004/010, 005/006"
  severity: medium
  mitigation: "Resolved by the coverage map above; enforced via the task frontmatter amendments so each task file's Scenarios row names only what it owns"

- description: "Token-resolution assertion logic (computed style vs resolved semantic-token var, OQ-5) will be needed in at least 6 e2e files (blog-detail, blog-mdx-mapping, blog-highlighting, blog, navigation, salvaged block) - copy-paste risk"
  severity: medium
  mitigation: "004 creates one shared helper under e2e/support/; 005/006/010 import it. If 005 merges before 004, transfer the creation responsibility at that point rather than duplicating"

- description: "Salvaged coexistence route-regression block: coexistence.spec.ts is deleted in 010 - a gap between deletion and salvage would drop route-regression coverage for /, /blog redirect, /blog/[slug], /author, /feed.xml"
  severity: medium
  mitigation: "Relocate the block into e2e/blog.spec.ts in the SAME 010 commit that deletes coexistence.spec.ts (both files are already in 010's estimated_files); relocation only - restating its color assertions via the token helper is in-scope, changing its route coverage is not"

- description: "navigation.spec.ts is edited by both 006 (chrome contracts) and 007 (author link) - risk of 007 rewriting 006's assertions"
  severity: low
  mitigation: "Sequencing already enforced (007 blocked_by 006); 007's changes are additive-only per its must_not_test"

- description: "001's build-output assertion runs against the pre-migration (MUI) post route; passing there doesn't guarantee the migrated surface - could be misread as double coverage with 004"
  severity: low
  mitigation: "Deliberate two-level design: 001 proves token sourcing at the earliest revertable commit (R-2), 004 re-proves on the new surface. Keep both; they have different Givens"

- description: "Storybook a11y-panel verification (003, 004, 005, 006 stories) is manual - no automated gate beyond lint:stories existence check"
  severity: low
  mitigation: "Accepted per CLAUDE.md workflow; story test_cases stay scoped to state coverage (variants, absent-fields, light+dark), not a11y automation this pack"
```

## 5. Task test_cases Amendments (applied to task frontmatter)

```yaml
"001":
  add: []
  remove: []
  notes: "Scenarios row: REMOVE shiki-gate-green (owned by 010 - its Given requires theme.ts deleted). Keep code-block-highlighted as owner. shikivars_test_passes_against_tokens_source_with_theme_ts_still_present stays - precursor gate, not the scenario"

"002":
  add:
    - "loader_carries_valid_coverimage_and_known_categories_into_post_model"
  remove: []
  shared_fixture_responsibility: "Create second published Post MDX under content/posts/ (valid coverImage, known categories, headings, fenced code block, external link) - consumed by 004 (prevnext), 005 (ordering, cover cards), and the e2e suites"

"003":
  add: []
  remove: []
  notes: "All six test cases stay; all unit/story level. Must not add route-level e2e (004's)"

"004":
  add:
    - "post_page_shows_cover_and_badges_when_present"
  remove: []
  shared_fixture_responsibility: "Create shared e2e token-resolution assertion helper (e2e/support/) implementing OQ-5; consumed by 005, 006, 010"
  notes: "Scenarios row: REMOVE code-block-highlighted (→001), cover-categories-render (→005), cover-categories-absent (→005), e2e-token-assertions (→010). Keep code_block_colors_resolve_from_shiki_vars and mdx_mapping_assertions_token_resolution_zero_rgb_literals as route-scoped restatements - different level than the owners, not duplication"

"005":
  add: []
  remove: []
  notes: "Sole owner of cover-categories-render and cover-categories-absent. home-index-renders stays but its light-theme clause is 006's (SF-4). Consumes 002's second-Post fixture and 004's token helper (or creates it if merging first - reassign explicitly then)"

"006":
  add: []
  remove: []
  notes: "Scenarios row: REMOVE home-index-renders (owned by 005; 006's light-default captures the carved-out clause). ThemePill dark-resolution assertion uses 004's shared token helper"

"007":
  add: []
  remove: []
  notes: "navigation.spec.ts edits additive-only (author-link assertions); do not touch 006's aria/#mobile-menu assertions"

"008":
  add: []
  remove: []
  notes: "Correctly marked 'mui-gone (partial - final verification owned by 010)'. No spec-scenario ownership; keep decrement checks"

"009":
  add: []
  remove: []
  notes: "Same as 008 - decrement/near-zero checks feed 010's gate condition; no ownership change"

"010":
  add:
    - "e2e_sources_contain_no_mui_era_rgb_literals"
  remove: []
  notes: "Sole owner of mui-gone, deps-removed-pins-exact, preflight-reenabled, shiki-gate-green, e2e-token-assertions, docs-current, sec-dep-removal-clean. Salvaged route-regression block relocates into e2e/blog.spec.ts in the same commit that deletes coexistence.spec.ts"
```

**Count note:** the spec contains 25 functional scenario headings + 6 security = 31 ids; all 31 mapped above.
