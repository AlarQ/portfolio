# PRD: GitHub Contribution Diagram Implementation

## 1. Overview

### 1.1 Feature Description
Implement an interactive GitHub contribution diagram (heat map) on the portfolio website that visualizes commit activity over the past year, similar to GitHub's profile contribution graph. The diagram will display a grid of squares representing days, with color intensity indicating contribution levels.

### 1.2 Goals
- Display GitHub contribution data in a visually appealing heat map format
- Integrate seamlessly with existing Next.js + MUI architecture
- Implement proper data fetching with caching for optimal performance
- Support responsive design across all device sizes
- Maintain type safety throughout the implementation

### 1.3 Success Criteria
- Contribution diagram renders correctly on the homepage
- Data updates automatically (with appropriate caching)
- Interactive tooltips show contribution details on hover
- Component follows existing design system and patterns
- No runtime errors or TypeScript issues

---

## 2. Technical Architecture

### 2.1 GitHub API Integration

#### 2.1.1 API Selection: GraphQL v4 API

**Why GraphQL over REST?**
- REST API does not expose contribution data publicly
- GraphQL provides precise control over data retrieval
- Single endpoint returns structured contribution calendar data

**Endpoint**: `https://api.github.com/graphql`

**Authentication**: Personal Access Token (PAT) required with `read:user` scope

#### 2.1.2 GraphQL Query Structure

```graphql
query GetUserContributions($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
  }
}
```

#### 2.1.3 Response Data Structure

```typescript
interface ContributionDay {
  date: string;              // ISO 8601 date (YYYY-MM-DD)
  contributionCount: number; // Number of contributions that day
  color: string;             // Hex color code (e.g., "#9be9a8")
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface GitHubContributionsResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: ContributionCalendar;
      };
    };
  };
}
```

#### 2.1.4 Rate Limits
- **Authenticated requests**: 5,000 points per hour
- **Contribution query cost**: ~1 point per request
- **Caching strategy**: Revalidate every 6 hours to stay well under limits

### 2.2 Next.js App Router Integration

#### 2.2.1 Server-Side Data Fetching

**Why Server Components?**
- API key remains server-side (security)
- Data fetching happens at build/request time
- Reduces client-side JavaScript bundle size
- Better SEO and initial page load performance

**Implementation Pattern**:
```typescript
// src/lib/github.ts
export async function fetchGitHubContributions(
  username: string
): Promise<ContributionCalendar> {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_CONTRIBUTIONS_QUERY,
      variables: { username },
    }),
    next: { revalidate: 21600 }, // 6 hours
  });
  
  // Error handling and data transformation
}
```

#### 2.2.2 Caching Strategy

**Next.js Data Cache**:
- Use `fetch` with `next.revalidate` option
- Revalidate every 6 hours (21,600 seconds)
- During build: Static generation with initial data
- In production: ISR (Incremental Static Regeneration)

**Alternative: On-Demand Revalidation**:
```typescript
// For manual cache refresh
revalidateTag('github-contributions');
```

### 2.3 Environment Variables

**Required Variables**:
```bash
# .env.local
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_USERNAME=AlarQ
```

**Token Requirements**:
- Create at: https://github.com/settings/tokens
- Scope required: `read:user` (or `public_repo` for public contributions only)
- No expiration recommended for portfolio site

**Security**:
- Never expose token in client-side code
- Add `.env.local` to `.gitignore`
- Use server-only data fetching

**Important - Private Contributions**:
- The `GITHUB_USERNAME` must match the owner of the `GITHUB_TOKEN` to display private contributions
- If they don't match, only public contributions will be shown
- The `read:user` scope only reveals private contributions for the token owner's account

---

## 3. Component Architecture

### 3.1 File Structure

```
src/
├── app/
│   └── page.tsx                  # Update to include ContributionGraph with Suspense
├── components/
│   └── ContributionGraph/
│       ├── index.tsx             # Main container component (Server)
│       ├── ContributionGraphClient.tsx # Visual component (Client) - NOTE: Named differently from server component
│       ├── ContributionDay.tsx   # Individual day square
│       ├── ContributionLegend.tsx # Legend for color levels
│       ├── MonthLabels.tsx       # Month labels above grid
│       ├── ContributionErrorBoundary.tsx # Error boundary for graceful error handling
│       └── types.ts              # TypeScript interfaces
├── lib/
│   └── github.ts                 # GitHub API utilities
└── types/
    └── contributions.ts          # Shared types
```

### 3.2 Component Hierarchy

```
Home (Server)
└── ContributionGraph (Server)
    └── ContributionGraphClient (Client)
        ├── ContributionGrid (render loop)
        │   └── ContributionDay[]
        ├── MonthLabels
        └── ContributionLegend
```

### 3.3 Component Specifications

#### 3.3.1 ContributionGraph (Server Component)

**Responsibilities**:
- Fetch contribution data server-side
- Pass data to client component
- Handle loading/error states

**Props Interface**:
```typescript
interface ContributionGraphProps {
  username: string;
}
```

**Implementation**:
```typescript
// Server component
import { fetchGitHubContributions } from '@/lib/github';
import { ContributionGraphClient } from './ContributionGraph';

export async function ContributionGraph({ username }: ContributionGraphProps) {
  const data = await fetchGitHubContributions(username);
  
  return <ContributionGraphClient data={data} />;
}
```

#### 3.3.2 ContributionGraphClient (Client Component)

**Responsibilities**:
- Render the contribution grid
- Handle hover interactions
- Display tooltips
- Responsive layout

**Props Interface**:
```typescript
interface ContributionGraphClientProps {
  data: ContributionCalendar;
}
```

**Key Features**:
- MUI Tooltip on each day square
- Responsive grid (scrollable on mobile)
- Accessible (ARIA labels)
- Theme-aware colors

#### 3.3.3 ContributionDay (Component)

**Responsibilities**:
- Render individual day square
- Handle hover/touch interactions
- Display tooltip with date and count

**Props Interface**:
```typescript
interface ContributionDayProps {
  date: string;
  count: number;
  color: string;
  size?: number;
}
```

**Design**:
- Square shape with rounded corners (2px radius)
- Default size: 10px x 10px
- Gap between squares: 3px
- Tooltip: "{count} contributions on {date}"

#### 3.3.4 ContributionLegend (Component)

**Responsibilities**:
- Display color scale explanation
- Show "Less" and "More" labels

**Design**:
- 5 color levels (from lightest to darkest)
- Horizontal layout
- Small squares matching grid style

---

## 4. UI/UX Design

### 4.1 Visual Design

#### 4.1.1 Layout

**Grid Structure**:
- **Columns**: 53 weeks (approximately 1 year)
- **Rows**: 7 days (Sunday to Saturday)
- **Total cells**: ~371 squares
- **Orientation**: Horizontal scroll on mobile, full view on desktop

**Dimensions**:
- Desktop: Full width of container, no scroll
- Mobile: Scrollable horizontally with overflow indicator
- Day square size: 10px x 10px
- Gap: 3px between squares

#### 4.1.2 Color Scheme

**Recommended: Use GitHub API Colors Directly**

The GitHub GraphQL API returns a `color` field for each day with the appropriate hex color. This is the recommended approach because:
- GitHub calculates color levels using percentile-based thresholds (not fixed counts)
- Ensures consistency with the user's actual GitHub profile
- Automatically handles edge cases (e.g., users with very high activity)

```typescript
// Use the color directly from the API response
backgroundColor: day.color
```

**GitHub Color Levels** (for reference only - don't hardcode these):
```typescript
// Light mode colors returned by GitHub API
const githubLightColors = {
  level0: '#ebedf0',  // No contributions
  level1: '#9be9a8',  // Low
  level2: '#40c463',  // Medium-low
  level3: '#30a14e',  // Medium
  level4: '#216e39',  // High
};

// Dark mode colors returned by GitHub API
const githubDarkColors = {
  level0: '#161b22',  // No contributions
  level1: '#0e4429',  // Low
  level2: '#006d32',  // Medium-low
  level3: '#26a641',  // Medium
  level4: '#39d353',  // High
};
```

**Alternative: Theme-Aware Colors** (optional):

If you want colors that match your MUI theme instead of GitHub's colors, you can map the API colors to theme values:

```typescript
const getThemeAwareColor = (githubColor: string, theme: Theme): string => {
  const colorMap: Record<string, string> = {
    '#ebedf0': theme.palette.action.hover,      // Level 0 (light)
    '#161b22': theme.palette.action.hover,      // Level 0 (dark)
    '#9be9a8': theme.palette.primary.light,     // Level 1
    '#0e4429': theme.palette.primary.light,     // Level 1
    '#40c463': theme.palette.primary.main,      // Level 2
    '#006d32': theme.palette.primary.main,      // Level 2
    '#30a14e': theme.palette.primary.dark,      // Level 3
    '#26a641': theme.palette.primary.dark,      // Level 3
    '#216e39': theme.palette.primary.dark,      // Level 4
    '#39d353': theme.palette.primary.dark,      // Level 4
  };
  return colorMap[githubColor] || githubColor;
};
```

**Note**: Avoid using fixed count thresholds (e.g., `count <= 3`) as these don't match GitHub's actual percentile-based algorithm.

#### 4.1.3 Typography

- **Title**: "GitHub Contributions" - MUI Typography variant="h6"
- **Subtitle**: "{totalContributions} contributions in the last year"
- **Tooltip**: MUI Tooltip with formatted date

### 4.2 Interactions

#### 4.2.1 Hover States

- **Day Square**: Slight brightness increase (filter: brightness(1.2))
- **Tooltip**: Appears immediately on hover
  - Content: "{count} contributions on {date}"
  - Format: "15 contributions on January 15, 2026"

#### 4.2.2 Mobile Interactions

- **Touch**: Tap to show tooltip (MUI handles this)
- **Scroll**: Horizontal swipe to view full year
- **Overflow indicator**: Fade gradient on edges

#### 4.2.3 Accessibility

- **ARIA labels**: Each day has `aria-label="{count} contributions on {date}"`
- **Keyboard navigation**: Tab through squares (if needed)
- **Screen readers**: Total contributions announced
- **Color contrast**: Ensure WCAG 2.1 AA compliance

### 4.3 Responsive Behavior

**Desktop (≥1024px)**:
- Full width display
- No horizontal scrolling
- Month labels visible above grid

**Tablet (768px - 1023px)**:
- Full width or slight padding
- May require minimal scroll

**Mobile (<768px)**:
- Horizontal scroll enabled
- Overflow-x: auto with smooth scrolling
- Visual indicators for scrollable content
- Touch-friendly tap targets (min 44px effective touch area)

**Touch Target Implementation**:

The visual squares are 10x10px with 3px gaps, but WCAG 2.1 requires 44x44px minimum touch targets. Solution: use an invisible expanded touch area:

```typescript
// Each day square has an invisible expanded touch target
<Box
  sx={{
    width: 10,
    height: 10,
    position: 'relative',
    // Invisible expanded touch target on mobile
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: 44, md: 10 },  // 44px on mobile, 10px on desktop
      height: { xs: 44, md: 10 },
      zIndex: 1,
    },
  }}
>
  {/* Visual square inside */}
</Box>
```

**Alternative (simpler)**: Increase square size on mobile devices:
```typescript
const SQUARE_SIZE = { xs: 12, sm: 10 };
const GAP_SIZE = { xs: 2, sm: 3 };
```

---

## 5. Data Flow

### 5.1 Data Fetching Sequence

```
1. Build Time
   └── fetchGitHubContributions()
       ├── POST to api.github.com/graphql
       ├── Parse response
       ├── Validate data structure
       └── Return ContributionCalendar

2. Server Component
   └── ContributionGraph (page.tsx)
       └── await fetchGitHubContributions()
           └── Pass data to client component

3. Client Component
   └── ContributionGraphClient
       └── Render grid with data
```

### 5.2 Error Handling

**Error Scenarios**:
1. **API Rate Limit**: Display cached data or error message
2. **Invalid Token**: Log error, display fallback UI
3. **User Not Found**: Display "Contributions unavailable" message
4. **Network Error**: Retry with exponential backoff

**Error Component**:
```typescript
interface ContributionGraphErrorProps {
  message: string;
  retry?: () => void;
}
```

### 5.3 Loading States

**Loading UI**:
- Skeleton placeholder matching final dimensions
- Animated shimmer effect (MUI Skeleton)
- Display while data is being fetched

**Suspense Integration** (Required):

The `ContributionGraphSkeleton` component must be used with React's `Suspense` to display during async data fetching:

```typescript
// src/app/page.tsx
import { Suspense } from 'react';
import { ContributionGraph, ContributionGraphSkeleton } from '@/components/ContributionGraph';

export default function HomePage() {
  return (
    <main>
      {/* Other sections */}
      
      <Suspense fallback={<ContributionGraphSkeleton />}>
        <ContributionGraph username={process.env.GITHUB_USERNAME!} />
      </Suspense>
    </main>
  );
}
```

**Why Suspense is Required**:
- Server Components with async operations need Suspense boundaries
- Without Suspense, the skeleton will never display during fetch
- Provides streaming SSR for better perceived performance

**Skeleton Implementation**:
```typescript
import { Skeleton, Box } from '@mui/material';

export function ContributionGraphSkeleton() {
  return (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="text" width={200} height={32} />
      <Skeleton variant="text" width={300} height={24} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={100} />
    </Box>
  );
}
```

---

## 6. Implementation Plan

### 6.1 Phase 1: Setup and API Integration (Priority: High)

**Tasks**:
1. [ ] Create `.env.local` with GitHub token
2. [ ] Install required dependencies (if any)
3. [ ] Create `src/lib/github.ts` with GraphQL query
4. [ ] Implement `fetchGitHubContributions()` function
5. [ ] Add error handling and validation
6. [ ] Create TypeScript interfaces

**Estimated Time**: 2-3 hours

**Files to Create**:
- `src/lib/github.ts`
- `src/types/contributions.ts`
- `.env.local` (if not exists)

**Testing**:
- Test API call with curl or Postman
- Verify response structure
- Check error handling

### 6.2 Phase 2: Core Components (Priority: High)

**Tasks**:
1. [ ] Create `ContributionGraph` server component
2. [ ] Create `ContributionGraphClient` client component
3. [ ] Implement grid rendering logic
4. [ ] Create `ContributionDay` component
5. [ ] Add month labels
6. [ ] Create `ContributionLegend` component

**Estimated Time**: 3-4 hours

**Files to Create**:
- `src/components/ContributionGraph/index.tsx` - Server component wrapper
- `src/components/ContributionGraph/ContributionGraphClient.tsx` - Client component (visual grid)
- `src/components/ContributionGraph/ContributionDay.tsx` - Individual day square (optional, can be inline)
- `src/components/ContributionGraph/ContributionLegend.tsx` - Legend for color levels
- `src/components/ContributionGraph/MonthLabels.tsx` - Month labels above grid
- `src/components/ContributionGraph/ContributionErrorBoundary.tsx` - Error boundary
- `src/components/ContributionGraph/types.ts` - TypeScript interfaces

**Testing**:
- Verify grid renders correctly
- Check responsive behavior
- Test with mock data

### 6.3 Phase 3: Styling and Interactions (Priority: Medium)

**Tasks**:
1. [ ] Implement color scheme (GitHub or theme-aware)
2. [ ] Add hover effects and transitions
3. [ ] Implement MUI Tooltips
4. [ ] Add responsive styles
5. [ ] Style the legend
6. [ ] Add loading skeleton

**Estimated Time**: 2-3 hours

**Files to Modify**:
- `src/components/ContributionGraph/ContributionGraph.tsx`
- `src/components/ContributionGraph/ContributionDay.tsx`
- `src/theme/theme.ts` (if theme-aware colors)

**Testing**:
- Test hover states
- Verify tooltip positioning
- Check mobile responsiveness
- Test loading state

### 6.4 Phase 4: Integration and Polish (Priority: Medium)

**Tasks**:
1. [ ] Integrate into `page.tsx`
2. [ ] Add section heading and total count
3. [ ] Implement error boundary
4. [ ] Add accessibility attributes
5. [ ] Performance optimization
6. [ ] Add documentation/comments

**Estimated Time**: 2 hours

**Files to Modify**:
- `src/app/page.tsx`
- `src/components/ContributionGraph/ContributionGraph.tsx`

**Testing**:
- Full integration test
- Accessibility audit (axe-core or Lighthouse)
- Performance check (Lighthouse)

### 6.5 Phase 5: Testing and Deployment (Priority: Low)

**Tasks**:
1. [ ] Write unit tests (optional)
2. [ ] Test error scenarios
3. [ ] Verify caching behavior
4. [ ] Run build and type-check
5. [ ] Deploy to production

**Estimated Time**: 1-2 hours

**Commands**:
```bash
npm run type-check
npm run build
npm run lint
```

---

## 7. Code Examples

### 7.1 GitHub API Utility

```typescript
// src/lib/github.ts
import { ContributionCalendar } from '@/types/contributions';

const GET_CONTRIBUTIONS_QUERY = `
  query GetUserContributions($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }
`;

export async function fetchGitHubContributions(
  username: string
): Promise<ContributionCalendar> {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_CONTRIBUTIONS_QUERY,
        variables: { username },
      }),
      next: { 
        revalidate: 21600, // 6 hours
        tags: ['github-contributions']
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error('Failed to fetch GitHub contributions:', error);
    throw error;
  }
}
```

### 7.2 Type Definitions

```typescript
// src/types/contributions.ts
export interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}
```

### 7.3 Client Component

```typescript
// src/components/ContributionGraph/ContributionGraphClient.tsx
// NOTE: File is named ContributionGraphClient.tsx to avoid collision with server component
'use client';

import { Box, Tooltip, Typography } from '@mui/material';
import { ContributionCalendar } from '@/types/contributions';
import { MonthLabels } from './MonthLabels';

interface ContributionGraphClientProps {
  data: ContributionCalendar;
}

export function ContributionGraphClient({ data }: ContributionGraphClientProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        GitHub Contributions
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {data.totalContributions} contributions in the last year
      </Typography>

      {/* Month labels above grid */}
      <MonthLabels weeks={data.weeks} />

      {/* Contribution grid */}
      {/* IMPORTANT: Use gridAutoFlow: 'column' to correctly render weeks as columns */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: 'repeat(7, 10px)',
          gridAutoFlow: 'column',           // Fill columns first (week by week)
          gridAutoColumns: '10px',          // Each column (week) is 10px wide
          gap: '3px',
          minWidth: 'max-content',
        }}
      >
        {data.weeks.map((week, weekIndex) =>
          week.contributionDays.map((day, dayIndex) => (
            <Tooltip
              key={`${weekIndex}-${dayIndex}`}
              title={`${day.contributionCount} contributions on ${formatDate(day.date)}`}
              arrow
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  backgroundColor: day.color,  // Use GitHub API color directly
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    filter: 'brightness(1.2)',
                    transform: 'scale(1.1)',
                  },
                }}
                aria-label={`${day.contributionCount} contributions on ${formatDate(day.date)}`}
              />
            </Tooltip>
          ))
        )}
      </Box>
    </Box>
  );
}
```

**Key Changes from Original**:
1. **File renamed** to `ContributionGraphClient.tsx` to avoid naming collision with server component
2. **Function renamed** to `ContributionGraphClient` for consistency
3. **Removed unused `useTheme` import** - we use GitHub API colors directly
4. **Removed `getContributionLevel` function** - uses `day.color` from API instead
5. **Fixed grid layout** - uses `gridAutoFlow: 'column'` for correct week rendering
6. **Added MonthLabels** component import and usage

### 7.4 Server Component

```typescript
// src/components/ContributionGraph/index.tsx
import { fetchGitHubContributions } from '@/lib/github';
import { ContributionGraphClient } from './ContributionGraphClient';  // Correct import path
import { Box, Skeleton, Typography } from '@mui/material';

interface ContributionGraphProps {
  username: string;
}

export async function ContributionGraph({ username }: ContributionGraphProps) {
  try {
    const data = await fetchGitHubContributions(username);
    return <ContributionGraphClient data={data} />;
  } catch (error: unknown) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch GitHub contributions:', error);
    }
    
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          GitHub Contributions
        </Typography>
        <Typography variant="body2" color="error">
          Unable to load contribution data. Please try again later.
        </Typography>
      </Box>
    );
  }
}

// Loading skeleton - used with Suspense in page.tsx
export function ContributionGraphSkeleton() {
  return (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="text" width={200} height={32} />
      <Skeleton variant="text" width={300} height={24} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={100} />
    </Box>
  );
}
```

**Key Changes from Original**:
1. **Fixed import path** - imports from `'./ContributionGraphClient'` instead of `'./ContributionGraph'`
2. **Removed alias import** - no longer uses `as ContributionGraphClient` since the file is correctly named
3. **Added proper error typing** - uses `error: unknown` for type safety
4. **Added development-only logging** - wraps console.error in NODE_ENV check

### 7.5 MonthLabels Component

```typescript
// src/components/ContributionGraph/MonthLabels.tsx
'use client';

import { Box, Typography } from '@mui/material';
import { ContributionWeek } from '@/types/contributions';

interface MonthLabelsProps {
  weeks: ContributionWeek[];
}

export function MonthLabels({ weeks }: MonthLabelsProps) {
  const months: { name: string; column: number }[] = [];
  let lastMonth = -1;

  // Calculate which weeks start a new month
  weeks.forEach((week, index) => {
    const firstDay = week.contributionDays[0];
    if (firstDay) {
      const date = new Date(firstDay.date);
      const month = date.getMonth();
      
      // Only add label when month changes
      if (month !== lastMonth) {
        months.push({
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          column: index,
        });
        lastMonth = month;
      }
    }
  });

  return (
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: '10px',
        gap: '3px',
        mb: 0.5,
        minWidth: 'max-content',
      }}
    >
      {weeks.map((_, index) => {
        const monthLabel = months.find((m) => m.column === index);
        return (
          <Typography
            key={index}
            variant="caption"
            sx={{
              fontSize: '9px',
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              overflow: 'visible',
              height: 12,
            }}
          >
            {monthLabel?.name || ''}
          </Typography>
        );
      })}
    </Box>
  );
}
```

**Explanation**:
- Iterates through weeks to find where each month starts
- Uses CSS Grid matching the contribution grid layout
- Only displays month names at the start of each new month
- Uses MUI Typography for consistent styling

### 7.6 Error Boundary Component

```typescript
// src/components/ContributionGraph/ContributionErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ContributionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'development') {
      console.error('ContributionGraph error:', error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            GitHub Contributions
          </Typography>
          <Typography variant="body2" color="error" gutterBottom>
            Something went wrong loading contributions.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={this.handleRetry}
            sx={{ mt: 1 }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
```

**Usage in page.tsx**:
```typescript
import { Suspense } from 'react';
import { ContributionGraph, ContributionGraphSkeleton } from '@/components/ContributionGraph';
import { ContributionErrorBoundary } from '@/components/ContributionGraph/ContributionErrorBoundary';

export default function HomePage() {
  return (
    <main>
      <ContributionErrorBoundary>
        <Suspense fallback={<ContributionGraphSkeleton />}>
          <ContributionGraph username={process.env.GITHUB_USERNAME!} />
        </Suspense>
      </ContributionErrorBoundary>
    </main>
  );
}
```

**Explanation**:
- Class component (required for error boundaries in React)
- Catches JavaScript errors in child component tree
- Displays fallback UI with retry button
- Logs errors only in development mode

---

## 8. Testing Strategy

### 8.1 Manual Testing Checklist

**Functionality**:
- [ ] Contributions load correctly
- [ ] Total count displays accurately
- [ ] Hover tooltips show correct data
- [ ] Grid displays full year of data
- [ ] Legend is visible and accurate

**Responsiveness**:
- [ ] Desktop: Full width, no scroll
- [ ] Tablet: Appropriate scaling
- [ ] Mobile: Horizontal scroll works
- [ ] Touch interactions work

**Accessibility**:
- [ ] ARIA labels present
- [ ] Color contrast sufficient
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

**Error Handling**:
- [ ] Invalid token shows error
- [ ] Rate limit handled gracefully
- [ ] Network errors display message
- [ ] Loading state visible

### 8.2 Performance Testing

**Metrics**:
- Initial load time: < 500ms
- Time to interactive: < 1s
- Lighthouse Performance score: > 90
- No layout shift during load

**Tools**:
- Chrome DevTools Lighthouse
- React DevTools Profiler
- Web Vitals (LCP, FID, CLS)

---

## 9. Maintenance and Future Enhancements

### 9.1 Monitoring

**Metrics to Track**:
- API error rates
- Response times
- Cache hit rates
- Client-side errors

### 9.2 Future Enhancements

**Potential Features**:
- [ ] Click day to see detailed contribution list
- [ ] Filter by repository or organization
- [ ] Compare multiple years
- [ ] Export data as CSV
- [ ] Show contribution streaks
- [ ] Integration with GitHub API v4 streaming

### 9.3 Known Limitations

**GitHub API Constraints**:
- Only shows contributions from last year
- Private contributions require specific permissions
- Rate limits apply

**Browser Support**:
- Requires modern browsers (ES6+)
- CSS Grid support required
- May not work in IE11 (not supported)

---

## 10. Dependencies and Resources

### 10.1 Required Dependencies

No additional dependencies required beyond existing project stack:
- Next.js 16 (already installed)
- React 19 (already installed)
- MUI 7 (already installed)
- TypeScript (already installed)

### 10.2 Optional Dependencies

For enhanced functionality:
```bash
# For date formatting (if not using native Intl)
npm install date-fns

# For advanced tooltip positioning (if needed)
npm install @floating-ui/react
```

### 10.3 Resources

**Documentation**:
- [GitHub GraphQL API](https://docs.github.com/en/graphql)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [MUI Components](https://mui.com/material-ui/getting-started/)

**GitHub API**:
- Endpoint: https://api.github.com/graphql
- Token Generation: https://github.com/settings/tokens
- Rate Limits: 5,000 points/hour

---

## 11. Summary

This PRD outlines a complete implementation plan for adding a GitHub contribution diagram to the portfolio website. The solution leverages:

1. **GitHub GraphQL API** for accurate contribution data
2. **Next.js App Router** with Server Components for optimal performance
3. **MUI 7** for consistent theming and interactions
4. **TypeScript** for type safety
5. **Responsive design** for all device sizes

**Total Estimated Time**: 10-14 hours across 5 phases

**Key Benefits**:
- Server-side data fetching keeps API keys secure
- Caching strategy minimizes API calls
- Component-based architecture enables reusability
- Type safety prevents runtime errors
- Responsive design works on all devices

**Next Steps**:
1. Generate GitHub Personal Access Token
2. Create `.env.local` with token
3. Start with Phase 1 (API integration)
4. Follow implementation plan sequentially
5. Test thoroughly before deployment
