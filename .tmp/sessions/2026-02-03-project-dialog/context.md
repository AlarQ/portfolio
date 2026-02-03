# Task Context: Project Detail Dialog

Session ID: 2026-02-03-project-dialog
Created: 2026-02-03T00:00:00Z
Status: in_progress

## Current Request
Add a click-to-open dialog feature for project cards that displays embedded GitHub Pages with detailed project information. When a user clicks on a project card, a dialog should open showing an iframe with the project's GitHub Pages site.

## Context Files (Standards to Follow)
- /Users/ernestbednarczyk/.config/opencode/context/core/standards/code-quality.md

## Reference Files (Source Material to Look At)
- /Users/ernestbednarczyk/Desktop/projects/portfolio/src/data/projects.ts
- /Users/ernestbednarczyk/Desktop/projects/portfolio/src/components/ProjectCard.tsx
- /Users/ernestbednarczyk/Desktop/projects/portfolio/src/app/projects/page.tsx
- /Users/ernestbednarczyk/Desktop/projects/portfolio/src/theme/theme.ts

## Components
1. **ProjectDetailDialog** - New MUI Dialog component for displaying embedded GitHub Pages
2. **Enhanced ProjectCard** - Add click handler to open the dialog
3. **Enhanced Projects page** - Manage dialog state

## Constraints
- Use MUI v7 Dialog component
- Follow dark theme styling from theme.ts
- Maintain TypeScript type safety
- Keep components under 100 lines
- Use functional programming patterns
- No hardcoded values - use theme variables

## Exit Criteria
- [ ] Project interface includes githubUrl field
- [ ] ProjectDetailDialog component created with iframe
- [ ] ProjectCard accepts onClick prop
- [ ] Projects page manages dialog state
- [ ] Dialog displays embedded GitHub Pages
- [ ] Build passes successfully
