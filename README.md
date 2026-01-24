# Portfolio

A personal portfolio website built as a learning project for mastering Next.js 16, React 19, TypeScript, and modern frontend development.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Webpack) - SSG, React Server Components, TypeScript-first
- **Language**: TypeScript (strict mode)
- **Styling**: Material UI 7 (MUI) - Comprehensive component library, theming, sx prop for custom styles
- **Content**: MDX + Velite - Type-safe content, React components in markdown, version controlled
- **Rendering**: Static Site Generation (SSG)
- **Deployment**: Vercel - Zero-config, preview deploys, edge functions

### Key Dependencies

```json
{
  "next": "^16.1.4",
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "typescript": "^5.7.0",
  "@mui/material": "^7.3.6",
  "@mui/icons-material": "^7.3.6",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.11.5",
  "velite": "^0.3.1",
  "@vercel/analytics": "latest"
}
```

## Project Structure

```
portfolio/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, ThemeRegistry, fonts, metadata
│   │   ├── page.tsx            # Homepage (hero, about, featured)
│   │   ├── globals.css         # Global styles
│   │   ├── blog/
│   │   │   ├── page.tsx        # Blog listing
│   │   │   └── [slug]/page.tsx # Blog post detail
│   │   └── projects/
│   │       ├── page.tsx        # Projects grid
│   │       └── [slug]/page.tsx # Project detail
│   ├── components/
│   │   ├── ThemeRegistry.tsx   # MUI theme provider for App Router
│   │   ├── Header.tsx          # Navigation header
│   │   ├── Footer.tsx          # Site footer
│   │   ├── ProjectCard.tsx     # Project card component
│   │   ├── BlogCard.tsx        # Blog card component
│   │   └── MdxComponents.tsx   # Custom MDX rendering with MUI
│   ├── theme/
│   │   └── theme.ts            # MUI theme configuration
│   └── lib/
│       └── utils.ts            # Helper functions
├── content/
│   ├── blog/                   # MDX blog posts
│   └── projects/               # MDX project pages
└── velite.config.ts            # Content schema configuration
```

## Commands

### Development

```bash
# Install dependencies
npm install

# Start development server (default: http://localhost:3000)
npm run dev

# Build production application
npm run build

# Start production server
npm run start
```

### Code Quality

```bash
# Lint code with ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting without writing
npm run format:check

# Type check
npm run type-check
```

### Dependency Management

Keep dependencies updated regularly to get security patches, bug fixes, and new features:

```bash
# Check for outdated packages
npm outdated

# Update dependencies to latest compatible versions (respects semver ranges)
npm update

# Update a specific package
npm update <package-name>

# Check for major version updates (requires manual package.json changes)
npx npm-check-updates
```

**Update frequency**: Check monthly, update minor/patch versions regularly, test major updates in a branch first.

## Deployment

Push to GitHub, connect to Vercel. Every push to main auto-deploys. PRs get preview URLs.

## Development Guidelines

See [AGENTS.md](./AGENTS.md) for detailed development guidelines and AI agent instructions.
