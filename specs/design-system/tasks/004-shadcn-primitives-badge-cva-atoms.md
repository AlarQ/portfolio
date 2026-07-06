---
id: "004"
name: shadcn primitives restyled to Figma + exhaustive Badge CVA + Atoms matrices
status: implemented
blocked_by: ["001", "002", "003"]
max_files: 18
ground_rules:
  - style/general.md
  - architecture/general.md
  - languages/typescript/type-safety.md
  - testing/principles.md
  - security/deps-and-config.md
  - frontend/components.md
  - frontend/styling.md
test_cases:
  - shadcn_primitives_land_in_components_tree_importing_semantic_tokens
  - primitives_restyled_match_figma_light_look_no_stock_default_color
  - badge_cva_map_defines_all_eight_category_hues
  - badge_missing_category_is_typescript_compile_error
  - atoms_have_named_story_per_variant_state_plus_playground
  - stories_titled_under_atoms_path
  - shadcn_generated_source_reviewed_as_first_party_deps_pinned
estimated_files:
  - components.json
  - src/lib/utils.ts
  - src/components/ui/badge.tsx
  - src/components/ui/badgeVariants.ts
  - src/components/ui/button.tsx
  - src/components/ui/input.tsx
  - src/components/ui/navigation-menu.tsx
  - src/components/ui/sheet.tsx
  - src/components/ui/card.tsx
  - src/components/ui/avatar.tsx
  - src/components/ui/badge.stories.tsx
  - src/components/ui/button.stories.tsx
  - src/components/ui/input.stories.tsx
  - src/components/ui/navigation-menu.stories.tsx
  - src/components/ui/card.stories.tsx
  - src/components/ui/avatar.stories.tsx
  - package.json
interaction: hitl
implementer: engineering/frontend-developer
---

## Objective
Stand up the atom layer — `badge/button/input/navigation-menu(+sheet)/card/avatar` restyled to the Figma light look through the semantic tokens, Badge categories as a closed CVA taxonomy — each verified by an exhaustive Storybook matrix.

## Implements
| Kind      | Ref                                                                 |
|-----------|---------------------------------------------------------------------|
| FR        | FR-4, FR-6, FR-7                                                     |
| Scenarios | shadcn-primitives-installed, primitives-restyled-to-figma, badge-category-exhaustive, badge-missing-category-compile-error, atoms-have-exhaustive-matrices, sidebar-atomic-design-order, component-uses-semantic-only, sec-deps-pinned-and-locked |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | a fresh `shadcn init` | badge, button, input, navigation-menu, sheet, card, avatar are added | each primitive's source lands in the components tree and imports the semantic tokens |
| 2 | the stock shadcn primitives | restyled to the Figma template | rendered appearance matches the Figma light look (primary `#7F56D9`, Inter) and no stock shadcn default color remains hardcoded in the primitive |
| 3 | the Badge CVA variant map typed as a closed union | the category taxonomy is defined | all 8 category hues (violet, blue/indigo, pink/magenta, sky, green, gray-blue, orange, rose/red) have a variant entry, and referencing a category without a matching entry is a TypeScript compile error, never a runtime fallback |
| 4 | an atom (e.g. Button, Badge) | its stories are authored | every variant/state combination has a named story plus a Playground, titled under `Atoms/` |
| 5 | shadcn-generated source and any new Radix/CVA deps | introduced | the generated source is reviewed as first-party code in the PR diff and new versions are pinned with the lockfile committed |

## Approach
- `shadcn init`/`add`; restyle through the semantic layer only (FR-3) — no raw hex, verified by Task 003's rule.
- Model Badge per FR-6 as an exhaustive `class-variance-authority` map (the shadcn analogue of `skillPresentation`'s `Record<IconKey, …>`).
- Author exhaustive variant/state matrices + a Playground per atom; use `Atoms/` title paths (FR-7 sidebar order).
- If `sheet`/`navigation-menu` story counts push past 20 files, split along the deploy boundary the PM flagged (interactive/nav vs display primitives) — do **not** pre-split.

## Implementation Log

### Visual Review

Human sign-off gate (Acceptance #2) — each atom below is pending human Storybook
review against the Figma light look (primary `#7F56D9`, Inter). This is a
recorded-approval checklist, not a mechanized/pixel-diff test; do not mark an
item approved without an actual human review.

- [ ] Badge — pending human Storybook review against Figma light look (primary #7F56D9, Inter)
- [ ] Button — pending human Storybook review against Figma light look (primary #7F56D9, Inter)
- [ ] Input — pending human Storybook review against Figma light look (primary #7F56D9, Inter)
- [ ] Navigation Menu — pending human Storybook review against Figma light look (primary #7F56D9, Inter)
- [ ] Sheet — pending human Storybook review against Figma light look (primary #7F56D9, Inter)
- [ ] Card — pending human Storybook review against Figma light look (primary #7F56D9, Inter)
- [ ] Avatar — pending human Storybook review against Figma light look (primary #7F56D9, Inter)

### Implementation Notes

chunks_spawned: 3

**Interface choices:**
- Badge carries both the pre-existing shadcn `variant` prop and a new `category` prop (per user decision — spec-language traceability over shorter naming). `category` is a closed union (`BADGE_CATEGORIES`: violet, indigo, pink, sky, green, gray-blue, orange, rose) resolved by an exhaustive `Record<BadgeCategory, string>` CVA map in `badgeVariants.ts`, mirroring `skillPresentation.tsx`'s exhaustive icon Record.
- `navigation-menu` and `sheet` were split into separate primitives/story files per explicit user instruction (not deferred to a 20-file breach as the task's Approach note originally suggested).
- Badge category exhaustiveness is enforced at compile time via a `// @ts-expect-error` type-fixture (`badgeVariants.typetest.ts`) checked by shelling to `tsc --noEmit` in a vitest test — no prior negative-type-fixture convention existed in this repo, so this establishes the pattern.
- `src/lib/utils.ts` (`cn` helper) was hand-added — the `shadcn` CLI did not scaffold it.

**Backlog deviations:**
- None substantive. Badge's `category` prop is additive to the existing `variant` prop rather than replacing it (kept both to avoid a breaking change to shadcn's stock API surface).

**Refactors applied:**
- Chunk 3 closing whole-diff refactor: confirmed `badgeVariants.ts` is still the single exhaustive source of truth with no drift across chunks. Reviewed all 7 `.stories.tsx` files for a shared "variant mapping" abstraction — rejected: each atom's variant shape is genuinely distinct (Badge categories vs Button size+variant vs Sheet side vs Avatar composition), so a generic story-factory would force an ill-fitting shared shape. Left as-is per simplicity-over-premature-abstraction.

**Verification:** `npm run type-check`, `npm run lint`, `npx vitest run` (169 passed / 1 pre-existing skip), `npm run build` all green after every chunk.
