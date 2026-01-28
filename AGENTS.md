# AGENTS.md

This file provides guidance when working with code in this repository.

## Project Overview

This is a personal portfolio website built with Next.js 16, React 19, TypeScript, and modern frontend development. It showcases:

1. **Homepage**: Hero section, about, featured projects, recent blog posts
2. **Blog**: List of blog posts with filtering by tags
3. **Projects**: Grid of project cards with tech stack details
4. **MDX Content**: Type-safe content management with frontmatter

The project uses Next.js 16 with App Router, Material UI 7 for styling, and Velite for MDX content processing with static site generation (SSG).

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

### Server Components vs Client Components

**Concept**: Default to Server Components unless the component needs client-side interactivity.

**When to use Client Components:**
- Component uses React hooks (useState, useEffect, useContext)
- Component uses browser-only APIs (window, localStorage)
- Component uses event handlers (onClick, onChange)
- Component uses Material-UI interactive components

**Pattern Explanation**: Maximize Server Component usage by fetching data in Server Components and passing it to Client Components for interactivity.

**Example**:
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

Velite processes MDX files at build time into type-safe TypeScript objects. You define a schema, and Velite generates types automatically.

**Content Schema Definition Pattern**

The schema defines what fields your content has and their types. Velite uses this to validate your MDX frontmatter and generate TypeScript types.

```typescript
// velite.config.ts
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

Velite generates an array of all content items. You can filter, sort, and manipulate this array using standard JavaScript array methods.

```typescript
// src/lib/content.ts
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

You can replace default HTML elements in MDX with custom React components. This lets you use MUI components for consistent styling.

```typescript
// src/components/MdxComponents.tsx
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

### Key Principles

- Define proper interfaces for all props, state, and content types
- Use discriminated unions for complex state management
- Never use `any` type - use `unknown` with type guards
- Leverage TypeScript's strict mode
- Infer types from Velite schema whenever possible

### Type Safety for Content

Velite auto-generates TypeScript types from your schema. Use these types for component props to get full type safety and autocomplete.

**Example**:
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

Type guards help you safely validate data at runtime while maintaining TypeScript's type safety.

**Example**:
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

## DRY Principles

### Custom Hooks for Stateful Logic

**Concept**: Extract reusable stateful logic into custom hooks to avoid duplication across components.

**Correct Pattern**:
```typescript
// Reusable hook for form inputs
function useFormInput(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  return { value, onChange: handleChange };
}

// Usage in multiple components
function ContactForm() {
  const email = useFormInput('');
  const name = useFormInput('');
  return (
    <form>
      <input {...email} placeholder="Email" />
      <input {...name} placeholder="Name" />
    </form>
  );
}
```

**Wrong Pattern** (DO NOT USE):
```typescript
// Duplicating useState and handlers in every form component
function ContactForm() {
  const [email, setEmail] = useState('');
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const [name, setName] = useState('');
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  // ... repeated in every form
}
```

**Why This Matters**: Custom hooks let you share logic without sharing state. Each component gets its own independent state, and you can reuse the same logic across multiple components without code duplication.

### TypeScript Utility Types for Type Reuse

**Concept**: Leverage TypeScript's built-in utility types to derive new types from existing ones without redefining fields.

**Correct Pattern**:
```typescript
// Base type from API or Velite schema
interface BlogPost {
  title: string;
  description: string;
  date: string;
  tags: string[];
  image?: string;
  featured: boolean;
  content: string;
}

// Derive component props using utility types
type BlogCardProps = Pick<BlogPost, 'title' | 'description' | 'image' | 'featured'>;
type BlogFormProps = Omit<BlogPost, 'content' | 'featured'>;
type BlogEditProps = Partial<BlogPost>;
type BlogRequired = Required<Pick<BlogPost, 'title' | 'content'>>;

// Combining utility types
interface BlogListProps {
  posts: BlogPost[];
  loading?: boolean;
}

type FilterableBlogListProps = BlogListProps & {
  selectedTag?: string;
};
```

**Wrong Pattern** (DO NOT USE):
```typescript
// Duplicating field definitions everywhere
interface BlogCardProps {
  title: string;
  description: string;
  image?: string;
  featured: boolean;
}

interface BlogFormProps {
  title: string;
  description: string;
  date: string;
  tags: string[];
  image?: string;
}
// Same fields repeated, breaking single source of truth
```

**Why This Matters**: Utility types maintain a single source of truth for type definitions. When the base type changes, all derived types update automatically, reducing maintenance burden and ensuring consistency.

### Component Composition Over Duplication

**Concept**: Use composition and shared base components instead of duplicating similar components.

**Correct Pattern**:
```typescript
// Base reusable card component
function BaseCard({ children, variant = "default" }: BaseCardProps) {
  const theme = useTheme();
  const borderColor = variant === "featured"
    ? theme.palette.primary.main
    : theme.palette.divider;

  return (
    <Card
      sx={{
        borderColor,
        borderWidth: variant === "featured" ? 2 : 1,
        borderRadius: 2,
      }}
    >
      {children}
    </Card>
  );
}

// Compose specialized cards using the base
function BlogCard({ post }: { post: BlogPost }) {
  return (
    <BaseCard variant={post.featured ? "featured" : "default"}>
      <CardMedia image={post.image} />
      <CardContent>
        <Typography variant="h5">{post.title}</Typography>
        <Typography variant="body2">{post.description}</Typography>
      </CardContent>
    </BaseCard>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <BaseCard variant="default">
      <CardContent>
        <Typography variant="h5">{project.title}</Typography>
        <Typography variant="body2">{project.description}</Typography>
      </CardContent>
    </BaseCard>
  );
}
```

**Wrong Pattern** (DO NOT USE):
```typescript
// Duplicating card structure and styling
function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Card
      sx={{
        borderColor: post.featured ? "#1976d2" : "rgba(0,0,0,0.12)",
        borderWidth: post.featured ? 2 : 1,
        borderRadius: 2,
      }}
    >
      {/* Card content */}
    </Card>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card
      sx={{
        borderColor: "rgba(0,0,0,0.12)",
        borderWidth: 1,
        borderRadius: 2,
      }}
    >
      {/* Card content - duplicated structure */}
    </Card>
  );
}
```

**Why This Matters**: Composition eliminates duplication while allowing flexibility. Base components handle shared structure and styling, while specialized components handle their specific content. Changes to the base component automatically propagate to all usages.

### Shared Utility Functions

**Concept**: Centralize reusable logic (formatters, validators, constants) in utility modules to avoid duplication across the codebase.

**Correct Pattern**:
```typescript
// src/lib/formatters.ts - Pure functions for data formatting
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function formatTechStack(techStack: string[]): string {
  return techStack.join(', ');
}

// src/lib/validators.ts - Pure functions for validation
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// src/lib/constants.ts - Centralized constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp'] as const;

// Usage across components
function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Card>
      <Typography variant="caption">
        {formatDate(post.date)}
      </Typography>
      <Typography variant="body1">
        {truncateText(post.description, 150)}
      </Typography>
    </Card>
  );
}
```

**Wrong Pattern** (DO NOT USE):
```typescript
// Duplicating formatting logic in each component
function BlogCard({ post }: { post: BlogPost }) {
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };
  return <Typography>{formatDate(post.date)}</Typography>;
}

function ProjectCard({ project }: { project: Project }) {
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };
  return <Typography>{formatDate(project.date)}</Typography>;
}
```

**Why This Matters**: Shared utility functions are easier to test, maintain, and reuse. Pure functions without side effects are predictable and can be imported wherever needed without duplicating logic.

### Theme-Driven Styling

**Concept**: Define design tokens once in the theme and reference them consistently instead of duplicating values.

**Correct Pattern**:
```typescript
// src/theme/theme.ts - Define once
export const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    success: { main: '#2e7d32' },
  },
  typography: {
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
  },
  spacing: 8, // Base spacing unit
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Usage - Reference theme tokens
function ProjectCard({ featured }: { featured: boolean }) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        borderColor: featured
          ? theme.palette.primary.main
          : theme.palette.divider,
        padding: theme.spacing(3),
      }}
    >
      <Typography variant="h1">Project Title</Typography>
    </Card>
  );
}
```

**Wrong Pattern** (DO NOT USE):
```typescript
// Hardcoding values throughout components
function ProjectCard({ featured }: { featured: boolean }) {
  return (
    <Card
      sx={{
        borderColor: featured ? '#1976d2' : 'rgba(0,0,0,0.12)',
        padding: 24, // Magic number, unclear reference
        borderRadius: 8, // Duplicated across components
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Repeated
      }}
    >
      <Typography
        sx={{
          fontSize: '2.5rem', // Duplicated from theme
          fontWeight: 700, // Duplicated from theme
        }}
      >
        Project Title
      </Typography>
    </Card>
  );
}
```

**Why This Matters**: Theme-driven styling ensures consistency, enables easy theme updates, and supports dark mode. Changing a color in the theme automatically updates all components using it.

### Content Schema Reuse

**Concept**: Reuse MDX component mappings and content loading patterns to avoid duplication across blog and project sections.

**Correct Pattern**:
```typescript
// src/lib/mdx.ts - Shared MDX configuration
import { Typography, Link, Box } from '@mui/material';

export const mdxComponents = {
  h1: (props) => <Typography variant="h1" gutterBottom {...props} />,
  h2: (props) => <Typography variant="h2" gutterBottom {...props} />,
  p: (props) => <Typography variant="body1" paragraph {...props} />,
  a: (props) => <Link {...props} />,
  Box: (props) => <Box {...props} />,
};

// src/lib/content.ts - Shared content utilities
import { blog, projects } from '@/.velite';

type ContentType = 'blog' | 'projects';

async function getContentByTag(
  collection: ContentType,
  tag: string,
  limit?: number
) {
  const items = collection === 'blog' ? blog : projects;
  const filtered = items.filter(item =>
    item.tags?.includes(tag)
  );
  return limit ? filtered.slice(0, limit) : filtered;
}

async function getFeaturedItems(
  collection: ContentType,
  limit = 3
) {
  const items = collection === 'blog' ? blog : projects;
  return items.filter(item => item.featured).slice(0, limit);
}

// Usage in blog and project pages
async function BlogPage() {
  const posts = await getFeaturedItems('blog');
  return <PostGrid items={posts} />;
}

async function ProjectsPage() {
  const projects = await getFeaturedItems('projects');
  return <ProjectGrid items={projects} />;
}
```

**Wrong Pattern** (DO NOT USE):
```typescript
// Duplicating MDX component mappings
// src/app/blog/[slug]/page.tsx
export const blogComponents = {
  h1: (props) => <Typography variant="h1" {...props} />,
  h2: (props) => <Typography variant="h2" {...props} />,
  p: (props) => <Typography variant="body1" {...props} />,
};

// src/app/projects/[slug]/page.tsx
export const projectComponents = {
  h1: (props) => <Typography variant="h1" {...props} />,
  h2: (props) => <Typography variant="h2" {...props} />,
  p: (props) => <Typography variant="body1" {...props} />,
};

// Duplicating filtering logic
async function getFeaturedBlogPosts() {
  return blog.filter(post => post.featured).slice(0, 3);
}

async function getFeaturedProjects() {
  return projects.filter(project => project.featured).slice(0, 3);
}
```

**Why This Matters**: Shared content schemas and utilities ensure consistent behavior across different content types. Changes to MDX components or loading logic propagate automatically, reducing maintenance overhead.

## Error Handling Patterns

### Type-Safe Error Handling

In TypeScript, caught errors have type `unknown`, not `Error`. You must validate the error type before accessing properties.

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

Console statements should only run in development to avoid exposing data in production and cluttering production logs.

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

- **Format**: `<type>(<scope>): <description>`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `build`, `ci`
- **Scope**: Optional, kebab-case format (e.g., `blog`, `projects`, `theme`, `mdx`, `ui`, `layout`)
- **Description**: Sentence-case, minimum 10 characters, no period at end
- **Max length**: 100 characters for entire commit header

### Commit Message Structure

```
<type>(<scope>): <description>
```

**Example commits:**

```
feat(theme): implement ThemeRegistry with Emotion SSR support
```

```
feat(blog): add tag filtering to blog listing page
```

```
fix(layout): resolve hydration mismatch in header component
```

**Validation Rules:**
- Type must be one of the allowed types listed above
- Scope must be kebab-case (not camelCase or PascalCase)
- Subject must be sentence-case and at least 10 characters
- No period at the end of the subject line
- Header cannot exceed 100 characters

## Git Push and Remote Repository Workflow

### Pushing Changes to Remote

**When pushing changes to a remote repository**, AI agents must follow this workflow:

1. **Create a branch** for the feature/fix (if not already on one)
2. **Stage and commit** all changes following the commit guidelines
3. **Push to remote** using `git push -u origin <branch-name>`
4. **Handle push hook failures** if they occur

### Handling Push Hook Failures

**Critical**: If push hooks fail (pre-push hooks, linting, type checking, tests, etc.), AI agents MUST:

1. **Identify the failure**: Read the error output to understand what failed (linting errors, type errors, test failures, etc.)
2. **Fix the issues**: Address all reported problems
3. **Stage the fixes**: Use `git add` to stage the fixed files
4. **Commit the fixes**: Create a new commit with the fixes (or amend the previous commit if appropriate)
5. **Push again**: Retry the push after fixes are committed

**Never push without committing fixes first**. All fixes must be committed before attempting to push again.

**Example workflow when hooks fail:**

```bash
# Attempt to push
git push -u origin feat/my-feature

# Hook fails with linting errors
# Error: "Formatter would have printed the following content..."

# Fix the formatting issues in the affected files
# (AI agent fixes the code)

# Stage the fixes
git add src/app/page.tsx

# Commit the fixes
git commit -m "fix(style): resolve formatting issues"

# Push again (now hooks should pass)
git push -u origin feat/my-feature
```

**Common hook failures and how to handle them:**

- **Linting/formatting errors**: Fix formatting, stage, commit, push
- **Type errors**: Fix TypeScript errors, stage, commit, push
- **Test failures**: Fix failing tests, stage, commit, push
- **Pre-push validation**: Address any validation issues, stage, commit, push

**Important**: Do not skip hooks or force push to bypass failures. All code quality checks must pass before changes are pushed to the remote repository.

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