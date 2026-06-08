# Findings: `portfolio`

**Date**: 2026-06-08
**Scope**: `src/components/TopicSection.tsx`, `src/components/ReadingSection.tsx`, `src/components/HeroContent.tsx`

---

## [dry-violations] Hover-glow card style copy-pasted across three components

**Severity**: Medium

**Files**:
- `src/components/TopicSection.tsx:21-28`
- `src/components/ReadingSection.tsx:49-54`
- `src/components/HeroContent.tsx:142-147`

**Problem**:
The same "transparent 3px border that lights up with an accent border + glow on hover" sx block is duplicated in three components. Only the accent color varies — `theme.palette.primary.main` in two of them, the per-area `area.color` in the third.

```tsx
// TopicSection.tsx:21-28
transition: "border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
border: "3px solid transparent",
borderRadius: 2,
p: 3,
"&:hover": {
  borderColor: theme.palette.primary.main,
  boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
},

// ReadingSection.tsx:49-54 — same shape
border: "3px solid transparent",
"&:hover": {
  borderColor: theme.palette.primary.main,
  boxShadow: `0 0 20px ${theme.palette.primary.main}40`,
},

// HeroContent.tsx:142-147 — same shape, accent is per-area
border: "3px solid transparent",
"&:hover": {
  borderColor: area.color,
  boxShadow: `0 0 20px ${alpha(area.color, 0.4)}`,
},
```

There is no name and no home for this visual rule. Changing the glow radius, border width, or transition timing means editing three files and keeping them in sync by hand. The `${color}40` hex-alpha suffix and the `alpha(color, 0.4)` call are two spellings of the same 25%/40% opacity intent, already inconsistent.

Deletion test: removing any single copy doesn't reduce complexity — the pattern reappears in the other two. Concentrating it into one module is the win.

**Fix**:
Add a presentation seam for the glow card — a pure `glowCardSx(accent: string)` factory (e.g. in `src/utils/`) returning the sx object, accent as the only parameter; or a `GlowCard` adapter component if structure is also shared. The three call sites pass their accent (`primary.main` or `area.color`). Pick one opacity spelling. A pure sx factory is directly unit-testable.

---
