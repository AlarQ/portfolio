---
id: "009"
name: Storybook production-exclusion guarantee + pre-push gate
status: todo
blocked_by: ["001", "004", "007"]
max_files: 5
ground_rules:
  - security/deps-and-config.md
  - architecture/general.md
  - testing/principles.md
test_cases:
  - prod_build_contains_no_storybook_runtime_or_static_dir
  - no_story_module_or_fixture_in_shipped_route_chunk
  - pre_push_gate_fails_if_storybook_output_in_build_tree
estimated_files:
  - next.config.ts
  - scripts/check-no-storybook-in-build.sh
  - src/security/storybook-prod-exclusion.test.ts
  - .husky/pre-push
  - package.json
interaction: afk
implementer: generalist
---

## Objective
Prove the production build ships no Storybook runtime, story modules, or `storybook-static/`, and wire the exclusion scan into the repo's authoritative pre-push gate so a push fails if any Storybook artifact appears in the build tree (FR-10). GitHub Actions is deploy-only (Vercel) and runs no checks — the gate must live in `.husky/pre-push` + a `src/security/` vitest test, matching the existing supply-chain-gate pattern (`src/security/ci-supply-chain.test.ts`).

## Implements
| Kind      | Ref                                                            |
|-----------|----------------------------------------------------------------|
| FR        | FR-10                                                          |
| Scenarios | prod-build-excludes-storybook, stories-not-in-ssg-output, sec-storybook-excluded-from-prod |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | a production `npm run build` | the SSG output is generated | it contains no Storybook runtime and no `storybook-static/` under the deployed tree |
| 2 | `*.stories.*` modules living beside components | the production bundle is emitted | no story module or fixture is included in a shipped route chunk |
| 3 | Storybook 9 with a dev-server config | the production `npm run build` output is scanned | the pre-push gate (`.husky/pre-push`), backed by a `src/security/` vitest test, fails the push if any Storybook output (`storybook-static/` or story chunks) is found in the build tree — GitHub Actions runs no checks |

## Approach
- Confirm Next build config excludes `*.stories.*`/fixtures from route chunks; assert no `storybook-static/` under the built output.
- Add `scripts/check-no-storybook-in-build.sh` (grep/scan of the build output) and assert it in `src/security/storybook-prod-exclusion.test.ts`, mirroring `src/security/ci-supply-chain.test.ts`.
- Wire the scan into `.husky/pre-push` (the authoritative gate) — the `sec-storybook-excluded-from-prod` guarantee. Do NOT add `.github/workflows/ci.yml`; Actions is deploy-only.

## Implementation Log
