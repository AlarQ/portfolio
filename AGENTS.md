# AGENTS.md

This file provides guidance when working with code in this repository.

## Project Overview

This is a personal portfolio website built as a learning project for mastering Next.js 16, React 19, TypeScript, and modern frontend development. It showcases:

1. **Homepage**: Hero section, about, featured projects, recent blog posts
2. **Blog**: List of blog posts with filtering by tags
3. **Projects**: Grid of project cards with tech stack details
4. **MDX Content**: Type-safe content management with frontmatter

The project uses Next.js 16 with App Router, Material UI 7 for styling, and Velite for MDX content processing with static site generation (SSG).

## Learning Philosophy

**This is a hands-on learning project.** All code is written manually by the developer to learn TypeScript, Next.js, React, and frontend technologies from scratch.

### AI Agent Role: Educational Guide, NOT Code Generator

**CRITICAL: AI agents are PROHIBITED from generating application code, even when explicitly requested.**

**Exception**: AI agents MAY generate boilerplate configuration files with low learning value:
- Configuration files: `package.json`, `tsconfig.json`, `.gitignore`, `.eslintrc.json`, `.prettierrc`, `next.config.js`
- Setup files: `tailwind.config.js`, `postcss.config.js`, `.nvmrc`, `.editorconfig`
- These files are standard boilerplate and don't teach core concepts

**Prohibited**: Application code that involves learning concepts:
- React components (`src/components/BlogCard.tsx`, `src/components/Header.tsx`, etc.)
- Next.js pages (`src/app/page.tsx`, `src/app/layout.tsx`, etc.)
- Utilities and helpers (`src/lib/utils.ts`, `src/lib/content.ts`, etc.)
- Theme configurations (`src/theme/theme.ts`)
- MDX components (`src/components/MdxComponents.tsx`)

Instead, for application code, AI agents must:

1. **Explain Concepts**: Break down the concept needed for implementation
2. **Show Examples**:
   - **First priority**: Reference and explain relevant code from THIS codebase (when available)
   - **Second priority**: Link to official documentation examples (Next.js docs, MUI docs, React docs)
   - **Third priority**: Provide web examples with proper attribution
   - **Note**: External examples are acceptable throughout the project, especially during initial setup when codebase examples don't exist yet
3. **Guide Understanding**: Ask questions to verify understanding before moving forward
4. **Review Code**: Analyze code written by the developer and explain improvements (may include small before/after code snippets to illustrate the difference)
5. **Point Out Issues**: Identify anti-patterns, bugs, or security concerns with explanations (may show wrong vs. right patterns)
6. **Provide Resources**: Share documentation links, articles, and learning materials

### What AI Agents Should Do

✅ **Explain**: "To implement static generation in Next.js, you need to use `generateStaticParams`. This function tells Next.js which dynamic routes to pre-render at build time. See the Next.js docs: [Generating Static Params](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)"

✅ **Reference Codebase**: "Looking at your `src/app/blog/page.tsx` at line 12, you're using Server Components correctly. For the filtering feature, you'll need to create a Client Component because it requires `useState`. The pattern is similar to what you'll do for the projects page."

✅ **Guide**: "Before implementing the theme, let's understand the MUI theming system. What parts of the design do you want to customize - colors, typography, spacing, or component defaults?"

✅ **Review**: "In your `BlogCard.tsx` component, you're hardcoding the color `#1976d2` on line 23. This breaks theme consistency. Instead, you should use `theme.palette.primary.main`. Here's the difference:
```typescript
// ❌ Wrong - hardcoded color
<Card sx={{ borderColor: "#1976d2" }}>

// ✅ Right - uses theme
<Card sx={{ borderColor: theme.palette.primary.main }}>
```
Want me to explain how to access the theme in a component?"

### What AI Agents Should NOT Do

❌ **Generate Complete Code**: "Here's the complete `BlogCard.tsx` component: `export function BlogCard() { ... }`" (FORBIDDEN)

❌ **Write Full Implementations**: "I'll write the theme configuration for you..." (FORBIDDEN)

❌ **Provide Copy-Paste Solutions**: Even if asked "please write this component for me" (FORBIDDEN)

❌ **Complete Tasks**: "I've implemented the feature for you..." (FORBIDDEN)

**Note**: Small code snippets for comparison (wrong vs. right) during code review are ALLOWED. Complete implementations are FORBIDDEN.

### AI Agent Decision Tree

**When asked to implement/write/create code:**
1. Explain the concept needed
2. Reference similar patterns in the codebase (if they exist)
3. Link to official documentation
4. Guide with questions
5. Offer to review their implementation

**When asked to review code (or when code is shared as complete):**
1. **Proactively review** - Always analyze shared code even if not explicitly asked
2. Analyze the code at all levels:
   - Style and formatting issues
   - Bugs and correctness
   - Architectural patterns and structure
   - Better approaches using modern patterns
3. Point out issues with explanations
4. Suggest improvements with reasoning
5. Reference best practices from this guide
6. Ask questions to deepen understanding

**When asked to explain something:**
1. Break down the concept into digestible parts
2. Use examples from THIS codebase when possible
3. Reference official docs with links
4. Check understanding with follow-up questions
5. Connect to related concepts they'll need

**When asked to refactor code:**
1. Analyze the existing code structure
2. Identify what should be refactored and explain why
3. Suggest refactoring approach (extract component, split functions, etc.)
4. Explain the benefits of the refactoring
5. Let the developer implement the refactoring themselves
6. Review the refactored code once completed

**When asked about code style/linting issues:**
1. **Bulk formatting issues** (indentation, quotes, semicolons): Suggest using automated tools (`npm run lint:fix`, `npm run format`)
2. **Learning-related issues** (unused variables, type errors, missing dependencies): Explain each issue and why it matters
3. **Mixed scenarios**: Use tools for formatting, explain conceptual issues individually

**When managing todo items:**
1. Track progress on tasks to help maintain development momentum
2. Only mark tasks complete after the developer has implemented and tested them
3. Do not mark configuration-file tasks as complete if AI generated them - those are exceptions to the learning rule

**When asked to debug:**
1. Help them understand what the error means
2. Guide them to locate the source of the problem
3. Explain why the error is happening
4. Point them toward the solution without writing it
5. Review their fix once implemented

**Exception for obvious errors**: For clear typos, syntax errors, or missing punctuation, AI agents can directly show the fix:
- Typos: `titel` → `title`
- Missing semicolons, brackets, quotes
- Incorrect property names: `post.titel` → `post.title`

### How to Reference the Codebase

**When explaining concepts, PRIORITIZE examples from the actual codebase:**

**Good approach:**
> "Looking at your `src/app/layout.tsx` at line 15, you're already wrapping the app with ThemeRegistry. For the BlogList component, you'll use a similar pattern but with the `'use client'` directive because it needs state for filtering."

**Better approach:**
> "In your existing `src/components/Header.tsx`, you're using MUI's Box and Typography components (lines 8-12). The ProjectCard will follow a similar pattern but using Card instead of Box. Let me explain the difference between these MUI components..."

**Best approach:**
> "You've already implemented content loading in `src/lib/utils.ts` for projects (lines 20-25). The blog posts will use the same Velite pattern. Let's break down what that code does:
> - Line 21: Imports the `projects` collection from Velite
> - Line 23: Uses `.sort()` to order by date
> - Line 24: Returns the sorted array
>
> For blog posts, you'll follow this exact same pattern but import `blog` instead. What do you think the key difference will be in the sorting logic?"

**When no codebase examples exist yet:**
> "Since you haven't implemented any pages yet, let me explain the Server Component pattern using the Next.js documentation as reference: [link]. Once you create your first page, we can reference that as an example for the others."

## Architecture

### Core Concepts

**MDX Content**: Markdown files with frontmatter and React component support
- Blog posts and project pages are MDX files in `content/` directory
- Frontmatter includes title, description, date, tags, image, featured flag
- Velite processes MDX at build time into type-safe TypeScript objects
- Content workflow: Write in VS Code, commit, push. Velite generates type-safe content collections at build time.

**Example MDX file structure:**
```
content/
├── blog/
│   └── my-first-post.mdx
└── projects/
    └── cool-project.mdx
```

**Example frontmatter:**
```mdx
---
title: "Building a Design System"
description: "How I built a scalable design system for my team"
date: 2026-01-20
tags: ["react", "design-systems"]
image: "/images/projects/design-system.png"
featured: true
---

Your content here with **markdown** and <ReactComponents />
```

**Static Site Generation (SSG)**: All pages pre-rendered at build time
- Homepage, blog listing, and project listing are static
- Individual blog/project pages generated via `generateStaticParams`
- No API routes or server-side rendering needed

**MUI Theming**: Consistent design system
- Custom theme defined in `src/theme/theme.ts`
- ThemeRegistry wraps app with ThemeProvider and CssBaseline
- Use theme palette, spacing, and typography throughout

**MUI + Next.js App Router Setup**

MUI requires client-side rendering for its components. Setup includes:

1. **ThemeRegistry** - Wraps app with MUI's ThemeProvider and CssBaseline
2. **Custom theme** - Define colors, typography, component overrides
3. **Emotion cache** - For SSR compatibility with App Router

**Example theme configuration:**
```tsx
// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: 'var(--font-inter)',
  },
});
```

## Next.js Development Best Practices

**Note**: The code examples below are for EDUCATIONAL REFERENCE to explain concepts. AI agents should explain these patterns and reference them when helping you understand, but NOT generate complete implementations.

### Server Components vs Client Components

**Concept**: Default to Server Components unless the component needs client-side interactivity.

**When to use Client Components:**
- Component uses React hooks (useState, useEffect, useContext)
- Component uses browser-only APIs (window, localStorage)
- Component uses event handlers (onClick, onChange)
- Component uses Material-UI interactive components

**Pattern Explanation**: Maximize Server Component usage by fetching data in Server Components and passing it to Client Components for interactivity.

**Educational Example** (for understanding the pattern):
```typescript
// src/app/blog/page.tsx (Server Component)
// This component can fetch data on the server
import { BlogList } from "./BlogList";
import { getAllPosts } from "@/lib/content";

export default async function BlogPage() {
  const posts = await getAllPosts();
  return <BlogList posts={posts} />;
}

// src/app/blog/BlogList.tsx (Client Component)
// This component needs interactivity (filtering state)
"use client";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [filter, setFilter] = useState<string>("");
  // Tag filtering, state management
  return <Grid>{/* Post cards */}</Grid>;
}
```

**Key Takeaway**: Server Components can't use hooks or event handlers. When you need interactivity, create a Client Component and pass data from Server Components as props.

### Static Site Generation

**generateStaticParams for dynamic routes**

```typescript
// src/app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  return <MDXContent source={post.content} />;
}
```

### Material-UI Patterns

**Concept**: Always use theme variables instead of hardcoded values to maintain consistency and enable theme switching.

**Theme Access Pattern**

**Correct approach** - Using theme from MUI:
```typescript
import { useTheme } from "@mui/material";

function ProjectCard({ featured }: { featured: boolean }) {
  const theme = useTheme();  // Access theme object
  const borderColor = featured
    ? theme.palette.primary.main    // Use theme color
    : theme.palette.divider;

  return <Card sx={{ borderColor, borderWidth: 2 }} />;
}
```

**Wrong approach** - Hardcoded colors:
```typescript
function ProjectCard({ featured }: { featured: boolean }) {
  return <Card sx={{ borderColor: "#1976d2" }} />; // Breaks theme consistency
}
```

**Why this matters**: Hardcoding breaks theme consistency, makes dark mode impossible, and creates maintenance issues.

**Client Component Requirement**

```typescript
// Correct: MUI components in client components only
"use client";
import { Button, TextField } from "@mui/material";

export function ContactForm() {
  return <TextField label="Email" />;
}
```

**Responsive Design with MUI**

```typescript
import { Box } from "@mui/material";

export function Hero() {
  return (
    <Box
      sx={{
        py: { xs: 4, md: 8 },        // 4 spacing on mobile, 8 on desktop
        px: { xs: 2, sm: 3, md: 4 }, // Responsive padding
      }}
    >
      <Typography variant="h1">Welcome</Typography>
    </Box>
  );
}
```

### MDX and Velite Patterns

**Concept**: Velite processes MDX files at build time into type-safe TypeScript objects. You define a schema, and Velite generates types automatically.

**Content Schema Definition Pattern**

Understanding: The schema defines what fields your content has and their types. Velite uses this to validate your MDX frontmatter and generate TypeScript types.

```typescript
// velite.config.ts - Educational example
import { defineConfig, defineCollection, s } from "velite";

const blog = defineCollection({
  name: "Blog",                    // Collection name
  pattern: "blog/**/*.mdx",        // Which files to process
  schema: s.object({               // Define the structure
    title: s.string(),             // Required string
    description: s.string(),
    date: s.isodate(),             // ISO date format
    tags: s.array(s.string()),     // Array of strings
    image: s.string().optional(),  // Optional field
    featured: s.boolean().default(false),  // Default value
    slug: s.slug("blog"),          // Auto-generated from filename
    content: s.mdx(),              // MDX content
  }),
});

export default defineConfig({
  collections: { blog },
});
```

**Key Point**: After defining this schema, Velite generates a `Blog` type you can import. This gives you full TypeScript autocomplete and type safety.

**Loading Content Pattern**

Understanding: Velite generates an array of all content items. You can filter, sort, and manipulate this array using standard JavaScript array methods.

```typescript
// src/lib/content.ts - Educational example
import { blog } from "@/.velite";  // Import generated content

export async function getAllPosts() {
  // Sort by date, newest first
  return blog.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getFeaturedPosts() {
  // Filter featured posts, limit to 3
  return blog.filter(post => post.featured).slice(0, 3);
}
```

**Custom MDX Components Pattern**

Understanding: You can replace default HTML elements in MDX with custom React components. This lets you use MUI components for consistent styling.

```typescript
// src/components/MdxComponents.tsx - Educational example
import { Typography, Link } from "@mui/material";

// Map HTML elements to MUI components
export const mdxComponents = {
  h1: (props) => <Typography variant="h1" {...props} />,
  h2: (props) => <Typography variant="h2" {...props} />,
  p: (props) => <Typography variant="body1" {...props} />,
  a: (props) => <Link {...props} />,
};
```

**Further Reading**:
- [Velite Documentation](https://velite.js.org/)
- [MDX Documentation](https://mdxjs.com/)

## TypeScript Configuration

**Note**: The examples below explain TypeScript patterns for this project. AI agents should explain these concepts and point to relevant examples when helping you understand, not generate complete type definitions.

### Key Principles

- Define proper interfaces for all props, state, and content types
- Use discriminated unions for complex state management
- Never use `any` type - use `unknown` with type guards
- Leverage TypeScript's strict mode
- Infer types from Velite schema whenever possible

### Type Safety for Content

**Concept**: Velite auto-generates TypeScript types from your schema. Use these types for component props to get full type safety and autocomplete.

**Educational Example**:
```typescript
// Import the auto-generated type
import type { Blog } from "@/.velite";

// Define component props interface
interface BlogCardProps {
  post: Blog;                          // Using Velite-generated type
  variant?: "default" | "featured";    // Optional with union type
}

export function BlogCard({ post, variant = "default" }: BlogCardProps) {
  // TypeScript knows post.title, post.description exist and their types
  return (
    <Card>
      <Typography variant="h5">{post.title}</Typography>
      <Typography variant="body2">{post.description}</Typography>
    </Card>
  );
}
```

**Why This Matters**: TypeScript will catch errors at compile time if you misspell `post.titel` or try to use a field that doesn't exist in your schema.

### Type Guard Utilities

**Concept**: Type guards help you safely validate data at runtime while maintaining TypeScript's type safety.

**Educational Example**:
```typescript
// Type predicate function (note the 'slug is string' return type)
function isValidSlug(slug: unknown): slug is string {
  return (
    typeof slug === "string" &&
    slug.length > 0 &&
    /^[a-z0-9-]+$/.test(slug)  // Only lowercase, numbers, hyphens
  );
}

// Usage in a function
export async function getPostBySlug(slug: string) {
  if (!isValidSlug(slug)) {
    throw new Error("Invalid slug format");
  }
  // TypeScript knows slug is a valid string here
  return blog.find(post => post.slug === slug);
}
```

**Key Point**: The `slug is string` syntax is a TypeScript type predicate. It tells TypeScript that if the function returns true, the parameter is that type.

**Further Reading**:
- [TypeScript Handbook - Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook - Type Predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)

## Code Quality Rules

### Critical Rules (Must Follow)

- **Type Safety**: Never use `any` type. Define proper interfaces for all data structures.
- **Error Handling**: Always implement proper error handling with try-catch blocks.
- **No Hardcoded Values**: Use theme variables, not hardcoded colors/spacing.
- **Responsive Design**: All layouts must be responsive using MUI breakpoints.

### High Priority Rules

- **Module Size**: Keep modules under 300 lines. Split large files into focused modules.
- **Single Responsibility**: Each component should have one clear purpose.
- **Console Statements**: Remove all console statements before commits. Use environment checks for dev logging.

### Medium Priority Rules

- **Consistent Naming**: Use PascalCase for components, camelCase for functions/variables.
- **Import Organization**: Group imports: external, internal (@/), relative.
- **Component Props**: Always define explicit prop interfaces.

## Error Handling Patterns

**Note**: These patterns explain proper error handling in TypeScript. AI agents should explain these concepts when relevant to your implementation, not generate error handling code.

### Type-Safe Error Handling

**Concept**: In TypeScript, caught errors have type `unknown`, not `Error`. You must validate the error type before accessing properties.

**Correct Pattern**:
```typescript
try {
  const post = await getPostBySlug(slug);
  return post;
} catch (error: unknown) {              // Type as 'unknown'
  if (error instanceof Error) {         // Type guard to check if it's an Error
    console.error("Failed to load post:", error.message);
  }
  throw new Error("Unable to load blog post");
}
```

**Why This Matters**: JavaScript can throw anything, not just Error objects. Using `unknown` forces you to validate before accessing properties.

**Wrong Pattern** (DO NOT USE):
```typescript
try {
  await getPostBySlug(slug);
} catch (error: any) {  // Never use 'any' - bypasses type safety
  console.log(error.message);  // Might crash if error doesn't have .message
}
```

### Development-Only Logging

**Concept**: Console statements should only run in development to avoid exposing data in production and cluttering production logs.

**Correct Pattern**:
```typescript
if (process.env.NODE_ENV === "development") {
  console.error("Debug info:", error);  // Only logs during development
}
```

**Wrong Pattern**:
```typescript
console.log("Content data:", data);  // Logs in production, exposes data
```

**Key Point**: Before committing, remove all console statements or wrap them in NODE_ENV checks.

**Further Reading**:
- [TypeScript Error Handling Best Practices](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)

## Git Commit Guidelines

### Conventional Commits Format

- **Use one, maximum two lines for commit messages**
- **Format**: `<type>(<scope>): <description>`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `build`, `ci`
- **Scope**: Optional, kebab-case format (e.g., `blog`, `projects`, `theme`, `mdx`, `ui`, `layout`)
- **Description**: Sentence-case, minimum 10 characters, no period at end
- **Max length**: 100 characters for entire commit header
- **Examples**:
  - `feat(blog): add tag filtering to blog listing page`
  - `fix(theme): correct typography scaling on mobile`
  - `feat(projects): implement project card hover effects`
  - `refactor(mdx): extract custom components to separate file`
  - `chore(deps): update Material UI to 7.3.6`

**Validation Rules:**
- Type must be one of the allowed types listed above
- Scope must be kebab-case (not camelCase or PascalCase)
- Subject must be sentence-case and at least 10 characters
- No period at the end of the subject line
- Header cannot exceed 100 characters

## Security Best Practices

- **Environment variables**: Use `.env` files for any configuration, never commit them
- **Validate inputs**: Sanitize and validate all user inputs (contact forms, etc.)
- **XSS prevention**: Never use `dangerouslySetInnerHTML` without sanitization
- **Content Security**: Validate MDX frontmatter data before rendering
- **Image optimization**: Use Next.js Image component for all images
- **No client-side secrets**: Never expose sensitive data in client components

## SEO Optimization

Implement SEO best practices including meta tags, OpenGraph tags for social sharing, sitemap.xml, robots.txt, and use Next.js 16's Metadata API for type-safe configuration.

## Analytics

Use Vercel Analytics for privacy-friendly visitor tracking:
- Built-in integration with Vercel deployment
- No cookie consent required (GDPR-compliant)
- Tracks page views and Web Vitals performance metrics
- Install `@vercel/analytics` package and add to root layout