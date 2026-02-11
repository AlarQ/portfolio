export interface RepositoryLanguage {
  name: string;
  size: number;
}

export interface RepositoryLineCount {
  name: string;
  primaryLanguage: string | null;
  totalSize: number;
  languages: RepositoryLanguage[];
}

export interface RepositoryLineCountsResponse {
  data: {
    user: {
      repositories: {
        nodes: Array<{
          name: string;
          primaryLanguage: {
            name: string;
          } | null;
          languages: {
            edges: Array<{
              size: number;
              node: {
                name: string;
              };
            }>;
          };
        }>;
      };
    };
  };
}

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
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalRepositoryContributions: number;
  weeks: ContributionWeek[];
}

export interface ContributionStats {
  totalCommits: number;
  totalPullRequests: number;
  activeRepositories: number;
  currentStreak: number;
  longestStreak: number;
  mostActiveDay?: string;
  topLanguages: string;
}

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

export interface ContributionGraphProps {
  username: string;
}

export interface ContributionGraphClientProps {
  data: ContributionCalendar;
  stats: ContributionStats;
}

export interface ContributionStatsProps {
  stats: ContributionStats;
}

export interface ContributionDayProps {
  date: string;
  count: number;
  color?: string;
  size?: number;
}
