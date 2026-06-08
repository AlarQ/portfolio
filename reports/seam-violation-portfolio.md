# Findings: `portfolio`

**Date**: 2026-06-08
**Scope**: `src/components/navigation/`, `src/theme/theme.ts`

---

## [seam-violation] Nav overlay colors bypass the single brand-color seam

**Severity**: Medium

**Files**:
- `src/components/navigation/Navigation.tsx:23` — `rgba(20, 27, 34, 0.85)`
- `src/components/navigation/Navigation.tsx:26-27` — `rgba(255, 255, 255, 0.12)`, black shadow rgba
- `src/components/navigation/MobileNav.tsx:113` — `rgba(0, 0, 0, 0.5)`
- `src/components/navigation/MobileNav.tsx:133` — `rgba(20, 27, 34, 0.95)`
- `src/components/navigation/MobileNav.tsx:136` — `rgba(0, 0, 0, 0.5)` shadow
- `src/components/navigation/MobileNav.tsx:208` — `color: brand.white`
- `src/components/navigation/DesktopNav.tsx:47` — `color: brand.white`
- `src/theme/theme.ts:24` — `backgroundPaper: "#141b22"`

**Problem**:
`theme.ts` declares itself **the** single brand-color seam: "Every named hue lives here once… Change a brand color in one place." Nav components violate this two ways.

1. **Re-typed hue as a hand-rolled alpha.** `rgba(20, 27, 34, 0.85)` in `Navigation.tsx:23` and `rgba(20, 27, 34, 0.95)` in `MobileNav.tsx:133` are `brand.backgroundPaper` (`#141b22` = rgb(20,27,34)) at 85% / 95% alpha — the brand hue re-typed by hand outside the seam. If `backgroundPaper` changes, these silently drift.

```tsx
// theme.ts:24
backgroundPaper: "#141b22",            // = rgb(20, 27, 34)
// Navigation.tsx:23 — same hue, alpha re-typed by hand, outside the seam
backgroundColor: "rgba(20, 27, 34, 0.85)",
```

2. **Overlay/shadow blacks and white-tints uncovered by the seam.** Backdrop scrims (`rgba(0,0,0,0.5)`), drawer shadows, and border tints (`rgba(255,255,255,0.12)`) are hardcoded in components. The seam has no tokens for these, so they leak. `brand.white` is also imported straight into `DesktopNav`/`MobileNav` (`:47`, `:208`) rather than resolved by `navPresentation.ts`, which already owns nav color resolution.

**Fix**:
Extend `brand` (or add a small alpha helper over existing tokens) with overlay/elevation tokens — e.g. `paperOverlay85`, `scrim`, `elevationShadow`, `borderSubtle` — so nav backgrounds, scrims, shadows, and borders consume named tokens instead of re-typed rgba. Route `brand.white` usages through `navPresentation.ts` so the two nav adapters cannot drift. Target files: add tokens in `theme.ts`, consume in `Navigation.tsx` / `MobileNav.tsx` / `DesktopNav.tsx`, resolve white in `navPresentation.ts`.

---
