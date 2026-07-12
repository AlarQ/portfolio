---
id: "001"
name: Project data model with authoritative slug set and pure slug gate
status: in-progress
blocked_by: []
max_files: 6
ground_rules:
  - languages/typescript/type-safety.md
  - languages/typescript/patterns.md
  - security/input-validation.md
  - security/authz.md
  - testing/structure.md
  - testing/test-quality.md
test_cases:
  - project_records_are_fully_typed_no_jsx_color_or_icon
  - invalid_slug_skipped_with_build_warning_never_path_joined
  - traversal_slug_fails_regex_core_never_touches_fs
  - validated_set_iteration_order_equals_declaration_order
  - techkey_outside_closed_union_is_compile_error
  - slug_regex_shared_constant_matches_blog_gate
estimated_files:
  - src/data/projects.ts
  - src/data/projectLoader.ts
  - src/data/projectLoader.test.ts
  - src/data/slug.ts
  - src/data/postLoader.ts
interaction: afk
implementer: engineering/frontend-developer
---

## Objective
Introduce `src/data/projects.ts` (typed, JSX-free `Project` record + owner-ordered array + `TechKey` closed union) and a `projectLoader.ts` pure core that validates every slug against the blog-identical `^[a-z0-9-]+$` gate, so the rest of the feature builds on one authoritative, validated slug set.

## Implements
| Kind      | Ref                                                        |
|-----------|-------------------------------------------------------------|
| FR        | FR-1, FR-2                                                  |
| Contract  | —                                                          |
| Data      | `Project`, `TechKey`                                        |
| Scenarios | first-pill-default, invalid-slug-skipped, slug-traversal-blocked |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | `projects.ts` declares the owner-curated ordered array | the array is read | each entry is a fully-typed `Project` (title, slug, tagline, status, mvpProgress 0–100, currentState, `techStack: readonly TechKey[]`, `relatedPosts: readonly {label,slug}[]`) with no JSX, color literal, or icon |
| 2 | a candidate slug violating `^[a-z0-9-]+$` | `buildProjectSet` runs over the candidates | the entry is skipped, a build warning naming it is emitted, and no invalid slug is ever joined to a path |
| 3 | a slug with a traversal segment (`../`) | `buildProjectSet` runs | it fails the regex and is skipped — the pure core never touches the filesystem with it |
| 4 | the validated project set | consumers read order | iteration order equals `projects.ts` declaration order (first entry is the default-selected Project) |
| 5 | a `TechKey` outside `{nextjs,react,typescript,tailwind,mdx,shadcn,biome,playwright,rss,node,claude}` | `type-check` runs | it is a compile error |

## Approach
- Mirror `buildPostSet` in `src/data/postLoader.ts` in spirit: a pure core over already-read inputs, `console.warn` + skip on invalid slug, no `fs` in the core.
- Extract the `^[a-z0-9-]+$` regex to a single shared constant (`src/data/slug.ts`) consumed by both `postLoader.ts` and `projectLoader.ts` so the gate cannot drift (Security Engineer note); keep the blog's behaviour byte-for-byte.
- `Project` is JSX/color/icon-free (seam pattern) — mirrors `domains.ts`. `TechKey` is a closed union; its Badge mapping is resolved in the seam (Task 003), not here.

## Implementation Log
