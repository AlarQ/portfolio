/**
 * GitHub API utility for fetching contribution data
 *
 * This module provides functions to interact with the GitHub GraphQL API
 * to fetch user contribution calendars. It uses Next.js's built-in fetch
 * caching for optimal performance.
 *
 * Key concepts demonstrated:
 * - Server-side API calls (keeps API keys secure)
 * - GraphQL queries with variables
 * - Next.js fetch caching with revalidation
 * - TypeScript error handling with unknown type
 * - Environment variable validation
 */

import type {
  ContributionCalendar,
  ContributionStats,
  GitHubContributionsResponse,
} from "@/types/contributions";

/**
 * GraphQL query to fetch user contribution calendar
 *
 * This query retrieves:
 * - Total contributions count for the last year
 * - Commit, PR, and repository contribution breakdowns
 * - Weekly breakdown with daily contribution counts
 * - Color coding for each day's contribution level
 *
 * The weeks array contains 53 weeks (approximately 1 year), starting from
 * the current week and going back 52 full weeks plus the current partial week.
 */
const GET_CONTRIBUTIONS_QUERY = `
  query GetUserContributions($username: String!) {
    user(login: $username) {
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalRepositoryContributions
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

/**
 * Fetches GitHub contribution data for a specific user
 *
 * Concepts:
 * - Server Components: This function runs on the server, keeping the API token secure
 * - Next.js Data Cache: Uses fetch with next.revalidate for automatic caching
 * - Type Safety: Returns properly typed ContributionCalendar data
 * - Error Handling: Uses TypeScript's unknown type with type guards
 *
 * @param username - GitHub username to fetch contributions for
 * @returns Promise<ContributionCalendar> - The user's contribution data
 * @throws Error if the API call fails or returns errors
 */
export async function fetchGitHubContributions(username: string): Promise<ContributionCalendar> {
  // Validate environment variables
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      "GITHUB_TOKEN environment variable is not set. " +
        "Please create a Personal Access Token at https://github.com/settings/tokens " +
        "with read:user scope and add it to your .env.local file."
    );
  }

  try {
    /**
     * Make the GraphQL API request
     *
     * Key Next.js options:
     * - next.revalidate: 21600 seconds = 6 hours
     *   This means the data will be cached for 6 hours before refetching.
     *   GitHub's rate limit is 5,000 points/hour, so this keeps us well under limits.
     *
     * - next.tags: ['github-contributions']
     *   Allows for manual cache invalidation using revalidateTag() if needed
     */
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_CONTRIBUTIONS_QUERY,
        variables: { username },
      }),
      next: {
        revalidate: 21600, // 6 hours
        tags: ["github-contributions"],
      },
    });

    // Check for HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `GitHub API HTTP error: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    // Parse the JSON response
    const result: GitHubContributionsResponse | { errors: Array<{ message: string }> } =
      await response.json();

    // Check for GraphQL errors
    if ("errors" in result && result.errors) {
      throw new Error(`GitHub GraphQL error: ${result.errors[0]?.message || "Unknown error"}`);
    }

    // Validate the response structure
    if (!("data" in result) || !result.data?.user?.contributionsCollection?.contributionCalendar) {
      throw new Error("Invalid response structure from GitHub API");
    }

    const collection = result.data.user.contributionsCollection;
    const calendar = collection.contributionCalendar;

    // Combine calendar data with collection-level stats
    return {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
      totalCommitContributions: collection.totalCommitContributions,
      totalPullRequestContributions: collection.totalPullRequestContributions,
      totalRepositoryContributions: collection.totalRepositoryContributions,
    };
  } catch (error) {
    /**
     * Type-safe error handling
     *
     * In TypeScript, caught errors have type 'unknown', not 'Error'.
     * We must validate the error type before accessing properties.
     * This prevents runtime errors if a non-Error value is thrown.
     */
    if (error instanceof Error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch GitHub contributions:", error.message);
      }
      throw error;
    }

    // Handle unexpected error types
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch GitHub contributions:", error);
    }
    throw new Error("An unexpected error occurred while fetching contributions");
  }
}

/**
 * Calculates contribution statistics from calendar data
 *
 * This function computes various metrics from the raw contribution data:
 * - Streak calculations (current and longest)
 * - Most active day of the week
 * - Most active repository
 *
 * Concepts:
 * - Array manipulation: flatMap() to flatten nested arrays, sort() with comparison functions
 * - Date calculations: Converting ISO dates to Date objects, getting day of week
 * - Statistical aggregation: Summing values, finding maxima
 *
 * @param data - ContributionCalendar data
 * @returns ContributionStats - Calculated statistics
 */
export function calculateStats(data: ContributionCalendar): ContributionStats {
  return {
    totalCommits: data.totalCommitContributions,
    totalPullRequests: data.totalPullRequestContributions,
    activeRepositories: data.totalRepositoryContributions,
    currentStreak: calculateCurrentStreak(data.weeks),
    longestStreak: calculateLongestStreak(data.weeks),
    mostActiveDay: calculateMostActiveDay(data.weeks),
  };
}

/**
 * Calculates the current contribution streak
 *
 * Counts consecutive days with contributions going backwards from today.
 * If today has no contributions, the streak is 0.
 *
 * @param weeks - Array of weeks with contribution days
 * @returns Current streak in days
 */
function calculateCurrentStreak(weeks: ContributionCalendar["weeks"]): number {
  // Flatten all days and sort by date
  const allDays = weeks.flatMap((week) => week.contributionDays);
  const today = new Date().toISOString().split("T")[0];

  // Find today's index
  const todayIndex = allDays.findIndex((day) => day.date === today);
  if (todayIndex === -1) return 0;

  // Count backwards from today
  let streak = 0;
  for (let i = todayIndex; i >= 0; i--) {
    if (allDays[i].contributionCount > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates the longest contribution streak
 *
 * Finds the maximum number of consecutive days with contributions
 * across the entire contribution history.
 *
 * @param weeks - Array of weeks with contribution days
 * @returns Longest streak in days
 */
function calculateLongestStreak(weeks: ContributionCalendar["weeks"]): number {
  const allDays = weeks.flatMap((week) => week.contributionDays);
  let maxStreak = 0;
  let currentStreak = 0;

  for (const day of allDays) {
    if (day.contributionCount > 0) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 0;
    }
  }

  return Math.max(maxStreak, currentStreak);
}

/**
 * Determines the most active day of the week
 *
 * Aggregates total contributions by day of the week and returns
 * the day with the highest total.
 *
 * @param weeks - Array of weeks with contribution days
 * @returns Day name (e.g., "Monday") or "None" if no contributions
 */
function calculateMostActiveDay(weeks: ContributionCalendar["weeks"]): string {
  const dayTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (const week of weeks) {
    for (const day of week.contributionDays) {
      const dayOfWeek = new Date(day.date).getDay();
      dayTotals[dayOfWeek] += day.contributionCount;
    }
  }

  const maxTotal = Math.max(...dayTotals);
  if (maxTotal === 0) return "None";

  const mostActiveDayIndex = dayTotals.indexOf(maxTotal);
  return dayNames[mostActiveDayIndex];
}

/**
 * Helper function to format contribution count for display
 *
 * @param count - Number of contributions
 * @returns Formatted string (e.g., "1 contribution" or "5 contributions")
 */
export function formatContributionCount(count: number): string {
  return count === 1 ? "1 contribution" : `${count} contributions`;
}

/**
 * Helper function to format date for display
 *
 * Converts ISO date string to a human-readable format
 * Uses the browser's Intl API for localization
 *
 * @param dateString - ISO 8601 date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "January 28, 2026")
 */
export function formatContributionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Helper function to get day of week name
 *
 * @param dateString - ISO 8601 date string (YYYY-MM-DD)
 * @returns Day name (e.g., "Monday")
 */
export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}
