/**
 * ContributionGraph Server Component
 *
 * This is a Server Component (async) that fetches contribution data
 * from the GitHub API and passes it to the Client Component for rendering.
 *
 * Key concepts demonstrated:
 * - Server Components for data fetching
 * - Async components in Next.js App Router
 * - Error boundaries with try-catch
 * - Loading states with Suspense integration
 * - Separation of concerns (data fetching vs. rendering)
 */

import { Box, Paper, Skeleton, Typography } from "@mui/material";
import { calculateStats, fetchGitHubContributions } from "@/lib/github";
import { ContributionGraph as ContributionGraphClient } from "./ContributionGraph";

interface ContributionGraphContainerProps {
  username: string;
}

/**
 * Server Component that fetches and displays GitHub contribution data
 *
 * This component runs on the server and:
 * 1. Fetches data from GitHub GraphQL API
 * 2. Calculates statistics from the raw data
 * 3. Handles errors gracefully
 * 4. Passes data and stats to the Client Component
 *
 * The data fetching happens at build time (SSG) or request time (SSR),
 * depending on your Next.js configuration. The results are cached
 * according to the revalidate setting in fetchGitHubContributions().
 *
 * @param username - GitHub username to fetch contributions for
 */
export async function ContributionGraph({ username }: ContributionGraphContainerProps) {
  try {
    // Fetch contribution data from GitHub API
    // This fetch is cached for 6 hours (configured in src/lib/github.ts)
    const data = await fetchGitHubContributions(username);

    // Calculate statistics from the fetched data
    const stats = calculateStats(data);

    // Pass the fetched data and stats to the Client Component
    // The Client Component handles all interactivity (hover, tooltips, etc.)
    return <ContributionGraphClient data={data} stats={stats} />;
  } catch (error) {
    /**
     * Error handling in Server Components
     *
     * If fetching fails, we render a graceful error state instead of
     * crashing the entire page. This provides a better user experience
     * and allows the rest of the page to load normally.
     */
    console.error("Failed to render contribution graph:", error);

    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          GitHub Contributions
        </Typography>
        <Typography variant="body2" color="error">
          Unable to load contribution data. This could be due to:
        </Typography>
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <Typography component="li" variant="body2" color="text.secondary">
            Network connectivity issues
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            GitHub API rate limits
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Invalid authentication token
          </Typography>
        </Box>
      </Paper>
    );
  }
}

/**
 * Loading skeleton for the ContributionGraph
 *
 * This component is rendered by React's Suspense while the async
 * data fetching is in progress. It provides visual feedback to the
 * user that content is loading.
 *
 * Usage with Suspense:
 * ```tsx
 * <Suspense fallback={<ContributionGraphSkeleton />}>
 *   <ContributionGraph username="AlarQ" />
 * </Suspense>
 * ```
 */
export function ContributionGraphSkeleton() {
  // Generate unique cell IDs without using array indices
  const generateCellId = (weekNum: number, dayNum: number) =>
    `skeleton-cell-w${weekNum}-d${dayNum}`;

  // Pre-generate unique IDs for all cells
  const cellIds: string[] = [];
  for (let week = 0; week < 53; week++) {
    for (let day = 0; day < 7; day++) {
      cellIds.push(generateCellId(week, day));
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      {/* Title skeleton */}
      <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />

      {/* Subtitle skeleton */}
      <Skeleton variant="text" width={250} height={20} sx={{ mb: 3 }} />

      {/* Month labels skeleton */}
      <Box sx={{ display: "flex", gap: 4, mb: 1 }}>
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
          (month) => (
            <Skeleton key={`month-${month}`} variant="text" width={30} height={14} />
          )
        )}
      </Box>

      {/* Grid skeleton */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(53, 12px)",
          gridTemplateRows: "repeat(7, 12px)",
          gap: "3px",
        }}
      >
        {cellIds.map((cellId) => (
          <Skeleton
            key={cellId}
            variant="rectangular"
            width={12}
            height={12}
            sx={{ borderRadius: "2px" }}
          />
        ))}
      </Box>

      {/* Legend skeleton */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
        <Skeleton variant="text" width={30} height={14} />
        {["level-0", "level-1", "level-2", "level-3", "level-4"].map((level) => (
          <Skeleton
            key={level}
            variant="rectangular"
            width={12}
            height={12}
            sx={{ borderRadius: "2px" }}
          />
        ))}
        <Skeleton variant="text" width={30} height={14} />
      </Box>
    </Paper>
  );
}

// Re-export the Client Component for convenience
export { ContributionGraphClient };
