# Findings: `portfolio`

**Date**: 2026-06-08
**Scope**: `src/components/navigation/MobileNav.tsx`

---

## [coupling] MobileNav bundles five unrelated concerns in one 241-line component

**Severity**: Low

**Files**:
- `src/components/navigation/MobileNav.tsx:20-22` (open + mount state, first-link ref)
- `src/components/navigation/MobileNav.tsx:36-46` (global Escape-key listener)
- `src/components/navigation/MobileNav.tsx:49-58` (focus-first-link on open)
- `src/components/navigation/MobileNav.tsx:60-69` (body scroll-lock)
- `src/components/navigation/MobileNav.tsx:71-101` (framer-motion drawer/backdrop variants)
- `src/components/navigation/MobileNav.tsx:238` (portal render)

**Problem**:
One component owns five separable concerns: open/mount state, an Escape-key listener, focus management, body scroll-lock, motion variants, and portal rendering. The accessibility behaviors (escape-to-close, scroll-lock, focus-first) are generic and reusable but trapped inline, so none can be tested without rendering the entire drawer through a portal.

```tsx
// MobileNav.tsx — three separate effects, each a distinct concern
useEffect(() => { /* :37 Escape key */ ... }, [isOpen]);
useEffect(() => { /* :49 focus first link */ ... }, [isOpen]);
useEffect(() => { /* :60 body.style.overflow lock */ ... }, [isOpen]);
```

The `mounted` flag (`:21`) is not domain logic — it's a hydration workaround to gate `createPortal`. "If I press Escape, the drawer closes" cannot be asserted in isolation today.

**Fix**:
Extract the a11y behaviors into a `useDrawerA11y(isOpen, onClose)` seam (escape listener + scroll-lock + focus-first), leaving `MobileNav` as the rendering adapter. The hook becomes independently testable; the component shrinks to markup + motion. Alternatively, evaluate whether MUI `Drawer` (built-in focus trap, scroll-lock, escape handling) replaces most of this hand-rolled logic. Lower severity — the component works and is self-contained; this is a testability/locality improvement, not a defect.

---
