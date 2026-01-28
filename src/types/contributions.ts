/**
 * Type definitions for GitHub contribution data
 *
 * These interfaces define the structure of data returned by the GitHub GraphQL API
 * for contribution calendars. They ensure type safety throughout the application.
 */

/**
 * Represents a single day's contribution data
 * @property date - ISO 8601 date string (YYYY-MM-DD)
 * @property contributionCount - Number of contributions on this day
 * @property color - Hex color code for the contribution level
 */
export interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

/**
 * Represents a week of contributions (Sunday to Saturday)
 * @property contributionDays - Array of 7 ContributionDay objects
 */
export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

/**
 * Represents the complete contribution calendar data
 * @property totalContributions - Total contributions in the last year
 * @property totalCommitContributions - Total commit contributions in the last year
 * @property totalPullRequestContributions - Total pull request contributions in the last year
 * @property totalRepositoryContributions - Number of repositories with contributions
 * @property weeks - Array of 53 weeks of contribution data
 */
export interface ContributionCalendar {
  totalContributions: number;
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalRepositoryContributions: number;
  weeks: ContributionWeek[];
}

/**
 * Calculated statistics derived from contribution calendar data
 * @property totalCommits - Total commit contributions
 * @property totalPullRequests - Total pull request contributions
 * @property activeRepositories - Number of repositories with contributions
 * @property currentStreak - Current consecutive day streak with contributions
 * @property longestStreak - Longest consecutive day streak with contributions
 * @property mostActiveDay - Day of the week with most contributions
 */
export interface ContributionStats {
  totalCommits: number;
  totalPullRequests: number;
  activeRepositories: number;
  currentStreak: number;
  longestStreak: number;
  mostActiveDay: string;
}

/**
 * GraphQL API response structure
 * Nested structure matches GitHub's GraphQL schema
 *
 * Note: totalCommitContributions, totalPullRequestContributions,
 * and totalRepositoryContributions are fields on ContributionsCollection,
 * not ContributionCalendar
 */
export interface GitHubContributionsResponse {
  data: {
    user: {
      contributionsCollection: {
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        totalRepositoryContributions: number;
        contributionCalendar: ContributionCalendar;
      };
    };
  };
}

/**
 * Props for the ContributionGraph server component
 * @property username - GitHub username to fetch contributions for
 */
export interface ContributionGraphProps {
  username: string;
}

/**
 * Props for the ContributionGraphClient component
 * @property data - ContributionCalendar data to render
 * @property stats - Calculated contribution statistics
 */
export interface ContributionGraphClientProps {
  data: ContributionCalendar;
  stats: ContributionStats;
}

/**
 * Props for the ContributionStats component
 * @property stats - Calculated contribution statistics to display
 */
export interface ContributionStatsProps {
  stats: ContributionStats;
}

/**
 * Props for individual ContributionDay component
 * @property date - ISO date string
 * @property count - Number of contributions
 * @property color - Hex color from API (optional, we'll calculate our own)
 * @property size - Size of the square in pixels (default: 10)
 */
export interface ContributionDayProps {
  date: string;
  count: number;
  color?: string;
  size?: number;
}
