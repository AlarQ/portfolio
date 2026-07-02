---
id: "005"
name: Typography and readability pass
status: todo
blocked_by: []
max_files: 4
ground_rules:
  - frontend/styling.md
  - frontend/design-tokens.md
  - frontend/accessibility.md
  - testing/test-quality.md
test_cases:
  - presentation_seams_reference_brand_tokens_only_no_raw_hex
  - seam_styles_apply_consistent_rhythm_and_scale
  - e2e_prose_container_width_stays_within_64ch_at_desktop
estimated_files:
  - src/utils/mdxPresentationText.tsx
  - src/utils/mdxPresentationBlock.tsx
  - src/theme/theme.ts
  - src/utils/mdxPresentation.test.tsx
interaction: afk
implementer: engineering/frontend-developer
---

## Objective
Improve long-form legibility (measure, line-height, rhythm, scale, code-block readability) entirely within the existing `*Presentation` seams and `brand`/`shikiVars` tokens, adding no new color literals.

## Implements
| Kind      | Ref                                             |
|-----------|-------------------------------------------------|
| FR        | FR-4                                            |
| Scenarios | typography-measure-constrained, typography-tokens-only |

## Acceptance
| # | Given | When | Then |
|---|-------|------|------|
| 1 | a rendered Post body | the prose column is measured | line length stays within the constrained reading width — the measure is **`64ch`** (down from `68ch`), promoted from the raw `PostArticle` literal to a **named token in `theme.ts`** so prose and the ToC layout share one source of truth (grilling 2026-07-02) |
| 1b | the prose body text | it renders | body is **18px (`1.125rem`) at line-height `1.7`**, set once in `proseTextSx` (not per component) |
| 2 | the typography changes | the presentation seams and theme are inspected | every hue resolves from a `brand` token — no raw hex/color literal is introduced in any data or presentation module |
| 3 | the updated prose styles | headings, paragraphs, lists, inline code render | vertical rhythm and scale are consistent and driven from the shared seams, not per-component overrides |

## Approach
- **Typeface stays Geist Sans** — no font-family change (grilling 2026-07-02). The serif-vs-sans reading evidence shows no reliable screen advantage for serif; typeface class is a weaker lever than measure/size/line-height. A re-typeface, if ever wanted, is a separate identity ADR, not this task. `layout.tsx` is untouched.
- Set **body 18px / line-height 1.7 in `proseTextSx`** (replacing the current `1.75`); adjust `heading`, `Paragraph`, `Anchor`, `InlineCode` in `mdxPresentationText.tsx` and the block seams in `mdxPresentationBlock.tsx` for consistent rhythm/scale.
- **Measure → `64ch` as a named `theme.ts` token**; replace the raw `"68ch"` literal in `PostArticle.tsx` (and fix the "~68ch" doc comment at `PostArticle.tsx:20`) so the value has one seam shared with the ToC layout.
- Keep all colors as `brand` tokens; if a token is missing, add it to `theme.ts` (single color seam) rather than inlining a hex.
- **Contrast scope:** leave body text alone (`slateLight` on `backgroundDefault` ≈ 15:1, exceeds AAA). Only verify the muted `slate #64748b` where it carries readable text (≈3.5:1, under AA) and nudge lighter if it fails; defer if syntax-comment-only.
- Extend the `shikiVars.test.ts` no-raw-hex discipline to guard the seams.

## Implementation Log
