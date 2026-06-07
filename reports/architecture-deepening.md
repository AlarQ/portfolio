# Architecture Deepening Opportunities

_Generated 2026-06-07 via `/improve-codebase-architecture`. Scope: `src/`._

The codebase already has a good seam pattern — `utils/skillPresentation.tsx`,
`utils/readingPresentation.ts`. The friction is that the pattern is applied
**inconsistently**, and one domain concept (**Domain Area**) has no home at all.
Candidates are ranked deepest-first. Vocabulary: domain terms from `CONTEXT.md`,
architecture terms (module / seam / depth / locality / leverage / deletion test)
from the skill's `LANGUAGE.md`.

---

## 1. Domain Area has no module — concept smeared across parallel arrays — RESOLVED (2026-06-07)

**Files:** `src/data/experience.ts`, `src/data/skills.ts`, `src/app/page.tsx:26-49`,
`src/components/HeroContent.tsx` (whole prop surface), `src/theme/theme.ts:18-21`

**Problem:** `CONTEXT.md` defines _"A Domain Area is evidenced by Achievements and
rated by Skills — two views, one area."_ But there is no Domain Area in code.
The area is encoded as **parallel array names** plus **parallel props**:

- `leadershipSkills` / `technicalSkills`, `leadershipAchievements` / `technicalAchievements`
- `page.tsx` threads 4 separate props + 2 `ExperienceSection` objects into `HeroContent`
- color (`#5f9610` lime / `#c55a0d` orange), icon, title, description for each area
  live inside `page.tsx` prop objects, not tied to the area

Deletion test: to add a 3rd Domain Area you touch 2 data files (2 new arrays),
`page.tsx` (2 new props + a section object), and `HeroContent` (a new branch).
Complexity reappears across 4 callers — the concept is earning its keep but has no home.

**Solution:** One `DomainArea` module — a list of areas, each holding
`{ name, color, icon, blurb, achievements, skills }`. Skills and Achievements
reference their area. `HeroContent` and `page` render by mapping over areas
instead of hand-wiring leadership-vs-technical twins.

**Benefits:**
- **Locality** — adding or renaming an area is one edit in one place.
- **Leverage** — `HeroContent` stops being a 2-section hardcode and becomes area-driven.
- **Test surface** — "which skills + achievements belong to Leadership?" becomes a
  pure function testable without rendering.
- Kills the leadership/technical duplication at its root.

---

## 2. Achievement + Project missing presentation seams (Skill/Reading have them) — RESOLVED (2026-06-07)

**Files:** `src/components/AchievementsList.tsx:27-33`, `src/components/ProjectCard.tsx:23-27`

**Problem:** Inconsistent seam coverage. `AchievementsList` hardcodes its icon
(`CheckCircleIcon`) and `primary.main` inline. `ProjectCard` buries the MVP Progress
threshold rule (≥80 → success, ≥50 → primary, else secondary) in a render-local
`getProgressColor`. Both are exactly what `skillPresentation` / `readingPresentation`
already solved for other concepts.

**Solution:** `projectPresentation.ts` exposing `mvpProgressColor(progress)`; optional
`achievementPresentation`. Move the threshold business rule out of the component.

**Benefits:**
- **Test surface** — the MVP Progress color rule (the real business logic) gets unit-tested
  without rendering a Card.
- **Locality** — MVP Progress styling lives with the Project concept, matching the
  existing pattern.
- **Leverage** — any future Project view reuses it.

---

## 3. Theme is shallow — brand colors scattered as raw hex, not tokens

**Files:** `src/theme/theme.ts` (only 4 palette entries), `src/utils/skillPresentation.tsx:55-62`,
navigation files, `HeroContent`

**Problem:** The theme seam is nearly empty; the real brand palette lives scattered.
Smell: `skillPresentation` comments literally say `// lime from ReadingSection` and
`// limeGreen from theme` — colors copied by **comment reference** instead of imported.
The same hex (`#0ea5e9`, `#84cc16`, `#f97316`) is re-typed across 3+ files.
`serviceCardColors` is a half-step (2 colors) sitting outside the palette.

**Solution:** Make the theme the single color seam — extend the palette / custom tokens
with the named brand colors. Presentation seams pull from the theme, not from literals.

**Benefits:**
- **Locality** — one color definition; every seam imports it.
- **Deletion test** passes hard: theme tokens concentrate what is now smeared across 5 files.
- Underpins #1 and #2 (Domain Area color and MVP color come from here).

---

## 4. Navigation presentation duplicated across 4 files (real seam, 2+ adapters)

**Files:** `src/components/navigation/DesktopNav.tsx:39,58`,
`src/components/navigation/MobileNav.tsx:200,219`,
`src/components/navigation/NavLink.tsx:31,41`,
`src/components/navigation/HamburgerButton.tsx:25`

**Problem:** The identical logo gradient `linear-gradient(135deg,#38bdf8,#0ea5e9,#0284c7)`
is hardcoded in **both** `DesktopNav` and `MobileNav`. Two adapters using the same thing =
a real seam that is currently missing. Nav link colors and the hover rgba are also raw hex.

**Solution:** A `navPresentation` module (or theme tokens) holding the gradients and nav
colors once.

**Benefits:**
- **Locality** — change the brand gradient once; both navs follow.
- Removes copy-paste drift risk between desktop and mobile.

---

## 5. (Minor) Carousel logic welded into ReadingSection render

**Files:** `src/components/ReadingSection.tsx:18-47`

**Problem:** Index wrapping, prev/next, and length-change reset are mixed into ~270 lines
of JSX. The wrap logic can't be tested without rendering.

**Solution:** Extract a `useCarousel(length)` hook — pure-ish state logic, testable alone.

**Benefits:**
- **Test surface** for the index math; thins the largest component.
- Lower priority — single caller, so this is a hypothetical seam, not a real one.

---

## Recommendation

Start with **#1 (Domain Area)** — it is the deepest, and #2 (presentation seams) and
#3 (theme tokens) fall out of it naturally.
