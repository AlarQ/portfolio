import type {
  ContributionCalendar,
  ContributionStats,
  GitHubContributionsResponse,
} from "@/types/contributions";

const GET_CONTRIBUTIONS_QUERY = `
  query GetUserContributions($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
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

const _GET_REPOSITORIES_QUERY = `
  query GetRepositories($username: String!) {
    user(login: $username) {
      repositories(
        first: 20
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          name
          primaryLanguage {
            name
          }
          languages(first: 10) {
            edges {
              size
              node {
                name
              }
            }
          }
        }
      }
    }
  }
`;

const _GET_CONTRIBUTION_REPOS_QUERY = `
  query GetContributionRepos($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        commitContributionsByRepository(maxRepositories: 100) {
          repository {
            name
            owner {
              login
            }
          }
          contributions {
            totalCount
          }
        }
        pullRequestContributionsByRepository(maxRepositories: 100) {
          repository {
            name
            owner {
              login
            }
          }
          contributions {
            totalCount
          }
        }
      }
    }
  }
`;

async function fetchContributionsForPeriod(
  username: string,
  from: string,
  to: string
): Promise<ContributionCalendar> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      "GITHUB_TOKEN environment variable is not set. " +
        "Please create a Personal Access Token at https://github.com/settings/tokens " +
        "with read:user scope and add it to your .env.local file."
    );
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_CONTRIBUTIONS_QUERY,
      variables: { username, from, to },
    }),
    next: {
      revalidate: 21600,
      tags: ["github-stats-2year"],
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GitHub API HTTP error: ${response.status} ${response.statusText}. ${errorText}`
    );
  }

  const result: GitHubContributionsResponse | { errors: Array<{ message: string }> } =
    await response.json();

  if ("errors" in result && result.errors) {
    throw new Error(`GitHub GraphQL error: ${result.errors[0]?.message || "Unknown error"}`);
  }

  if (!("data" in result) || !result.data?.user?.contributionsCollection?.contributionCalendar) {
    throw new Error("Invalid response structure from GitHub API");
  }

  const collection = result.data.user.contributionsCollection;
  const calendar = collection.contributionCalendar;

  return {
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks,
    totalCommitContributions: collection.totalCommitContributions,
    totalPullRequestContributions: collection.totalPullRequestContributions,
    totalRepositoryContributions: collection.totalRepositoryContributions,
  };
}

function aggregateYearlyContributions(yearlyData: ContributionCalendar[]): ContributionCalendar {
  // Sum commits and PRs across all years
  const totalCommitContributions = yearlyData.reduce(
    (sum, year) => sum + year.totalCommitContributions,
    0
  );

  const totalPullRequestContributions = yearlyData.reduce(
    (sum, year) => sum + year.totalPullRequestContributions,
    0
  );

  // Sum active repos across both years (may slightly overcount if same repo in both years)
  const totalRepositoryContributions = yearlyData.reduce(
    (sum, year) => sum + year.totalRepositoryContributions,
    0
  );

  // Combine all weeks for total contributions
  const allWeeks = yearlyData.flatMap((year) => year.weeks);
  const totalContributions = yearlyData.reduce((sum, year) => sum + year.totalContributions, 0);

  return {
    totalContributions,
    totalCommitContributions,
    totalPullRequestContributions,
    totalRepositoryContributions,
    weeks: allWeeks, // All weeks for longest streak calculation
  };
}

async function fetchRepositoriesWithContributions(
  _username: string,
  from: string,
  to: string
): Promise<Set<string>> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN not set");
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  // Use REST API to get all repos (including private ones)
  const response = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=pushed&affiliation=owner,collaborator,organization_member",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const repos = await response.json();
  const activeRepos = new Set<string>();

  // Filter repos by push date within the specified range
  repos.forEach((repo: { pushed_at: string; full_name: string }) => {
    const pushedAt = new Date(repo.pushed_at);
    if (pushedAt >= fromDate && pushedAt <= toDate) {
      activeRepos.add(repo.full_name);
    }
  });

  return activeRepos;
}

async function fetchCommitCount(username: string, from: string, to: string): Promise<number> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN not set");
  }

  // Format dates as YYYY-MM-DD for the search API
  const fromDate = from.split("T")[0];
  const toDate = to.split("T")[0];

  const response = await fetch(
    `https://api.github.com/search/commits?q=author:${username}+committer-date:${fromDate}..${toDate}&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.cloak-preview+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const result = await response.json();
  return result.total_count || 0;
}

async function fetchPullRequestCount(username: string, from: string, to: string): Promise<number> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN not set");
  }

  // Format dates as YYYY-MM-DD for the search API
  const fromDate = from.split("T")[0];
  const toDate = to.split("T")[0];

  const response = await fetch(
    `https://api.github.com/search/issues?q=author:${username}+type:pr+created:${fromDate}..${toDate}&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const result = await response.json();
  return result.total_count || 0;
}

export async function fetchTwoYearContributions(username: string): Promise<{
  twoYearStats: ContributionCalendar;
  recentCalendar: ContributionCalendar;
  topLanguages: string;
}> {
  try {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    // Build year ranges for current and previous year
    const yearRanges = [
      {
        from: `${previousYear}-01-01T00:00:00Z`,
        to: `${previousYear}-12-31T23:59:59Z`,
      },
      {
        from: `${currentYear}-01-01T00:00:00Z`,
        to: new Date().toISOString(), // Up to now in current year
      },
    ];

    // Fetch contribution data and accurate counts using REST API in parallel
    const [
      previousYearData,
      currentYearData,
      prevRepos,
      currRepos,
      prevCommits,
      currCommits,
      prevPRs,
      currPRs,
    ] = await Promise.all([
      fetchContributionsForPeriod(username, yearRanges[0].from, yearRanges[0].to),
      fetchContributionsForPeriod(username, yearRanges[1].from, yearRanges[1].to),
      fetchRepositoriesWithContributions(username, yearRanges[0].from, yearRanges[0].to),
      fetchRepositoriesWithContributions(username, yearRanges[1].from, yearRanges[1].to),
      fetchCommitCount(username, yearRanges[0].from, yearRanges[0].to),
      fetchCommitCount(username, yearRanges[1].from, yearRanges[1].to),
      fetchPullRequestCount(username, yearRanges[0].from, yearRanges[0].to),
      fetchPullRequestCount(username, yearRanges[1].from, yearRanges[1].to),
    ]);

    // Combine repos from both years to get unique count
    const allRepos = new Set([...prevRepos, ...currRepos]);

    // Sum commits and PRs from both years
    const totalCommits = prevCommits + currCommits;
    const totalPRs = prevPRs + currPRs;

    if (process.env.NODE_ENV === "development") {
      console.log("\n=== GitHub Contribution Stats (2025 + 2026) ===");
      console.log(`Commits 2025: ${prevCommits}, 2026: ${currCommits}, Total: ${totalCommits}`);
      console.log(`PRs 2025: ${prevPRs}, 2026: ${currPRs}, Total: ${totalPRs}`);
      console.log(
        `Repos 2025: ${prevRepos.size}, 2026: ${currRepos.size}, Total: ${allRepos.size}`
      );
      console.log("\nRepositories:");
      Array.from(allRepos)
        .sort()
        .forEach((repo, i) => {
          console.log(`  ${i + 1}. ${repo}`);
        });
      console.log("===========================================\n");
    }

    // Keep current year's calendar for the heatmap
    const recentCalendar = currentYearData;

    // Aggregate both years for 2-year stats
    const twoYearStats = aggregateYearlyContributions([previousYearData, currentYearData]);

    // Override with accurate counts from REST API
    twoYearStats.totalRepositoryContributions = allRepos.size;
    twoYearStats.totalCommitContributions = totalCommits;
    twoYearStats.totalPullRequestContributions = totalPRs;

    // Fetch language statistics for all active repos
    const languageStats = await fetchLanguageStats(Array.from(allRepos));

    return {
      twoYearStats,
      recentCalendar,
      topLanguages: languageStats.topLanguages,
    };
  } catch (error) {
    // Fallback to single year if 2-year fetch fails
    if (process.env.NODE_ENV === "development") {
      console.warn("2-year fetch failed, falling back to current year only", error);
    }

    const currentYearStart = `${new Date().getFullYear()}-01-01T00:00:00Z`;
    const now = new Date().toISOString();

    const recentData = await fetchContributionsForPeriod(username, currentYearStart, now);

    return {
      twoYearStats: recentData,
      recentCalendar: recentData,
      topLanguages: "N/A",
    };
  }
}

export async function fetchGitHubContributions(username: string): Promise<ContributionCalendar> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(
      "GITHUB_TOKEN environment variable is not set. " +
        "Please create a Personal Access Token at https://github.com/settings/tokens " +
        "with read:user scope and add it to your .env.local file."
    );
  }

  try {
    const currentYearStart = `${new Date().getFullYear()}-01-01T00:00:00Z`;
    const now = new Date().toISOString();

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_CONTRIBUTIONS_QUERY,
        variables: { username, from: currentYearStart, to: now },
      }),
      next: {
        revalidate: 21600,
        tags: ["github-contributions"],
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `GitHub API HTTP error: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    const result: GitHubContributionsResponse | { errors: Array<{ message: string }> } =
      await response.json();

    if ("errors" in result && result.errors) {
      throw new Error(`GitHub GraphQL error: ${result.errors[0]?.message || "Unknown error"}`);
    }

    if (!("data" in result) || !result.data?.user?.contributionsCollection?.contributionCalendar) {
      throw new Error("Invalid response structure from GitHub API");
    }

    const collection = result.data.user.contributionsCollection;
    const calendar = collection.contributionCalendar;

    return {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
      totalCommitContributions: collection.totalCommitContributions,
      totalPullRequestContributions: collection.totalPullRequestContributions,
      totalRepositoryContributions: collection.totalRepositoryContributions,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch GitHub contributions:", error.message);
      }
      throw error;
    }

    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch GitHub contributions:", error);
    }
    throw new Error("An unexpected error occurred while fetching contributions");
  }
}

export function calculateStats(
  twoYearData: ContributionCalendar,
  recentData: ContributionCalendar,
  topLanguages: string = "N/A"
): ContributionStats {
  return {
    // 2-year stats
    totalCommits: twoYearData.totalCommitContributions,
    totalPullRequests: twoYearData.totalPullRequestContributions,
    activeRepositories: twoYearData.totalRepositoryContributions,
    longestStreak: calculateLongestStreak(twoYearData.weeks),
    mostActiveDay: calculateMostActiveDay(twoYearData.weeks),

    // Recent stats (current year only)
    currentStreak: calculateCurrentStreak(recentData.weeks),

    // Top languages by percentage
    topLanguages,
  };
}

function calculateCurrentStreak(weeks: ContributionCalendar["weeks"]): number {
  const allDays = weeks.flatMap((week) => week.contributionDays);
  const today = new Date().toISOString().split("T")[0];

  const todayIndex = allDays.findIndex((day) => day.date === today);
  if (todayIndex === -1) return 0;

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

function calculateMostActiveDay(weeks: ContributionCalendar["weeks"]): string {
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
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

export function formatContributionCount(count: number): string {
  return count === 1 ? "1 contribution" : `${count} contributions`;
}

export function formatContributionDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function _formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

async function fetchLanguageStats(repos: string[]): Promise<{
  topLanguages: string;
}> {
  const token = process.env.GITHUB_TOKEN;

  if (!token || repos.length === 0) {
    return { topLanguages: "N/A" };
  }

  try {
    const languageTotals = new Map<string, number>();

    // Fetch language data for each repository
    const languagePromises = repos.map(async (repoFullName) => {
      try {
        const response = await fetch(`https://api.github.com/repos/${repoFullName}/languages`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) return null;

        const languages = await response.json();
        return languages;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(languagePromises);

    // Aggregate language bytes across all repos
    for (const languages of results) {
      if (languages) {
        for (const [langName, bytes] of Object.entries(languages)) {
          languageTotals.set(langName, (languageTotals.get(langName) || 0) + (bytes as number));
        }
      }
    }

    if (languageTotals.size === 0) {
      return { topLanguages: "N/A" };
    }

    // Calculate total bytes and percentages
    const totalBytes = Array.from(languageTotals.values()).reduce((sum, val) => sum + val, 0);

    const sortedLanguages = Array.from(languageTotals.entries())
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: ((bytes / totalBytes) * 100).toFixed(1),
      }))
      .sort((a, b) => b.bytes - a.bytes);

    // Get top 3 languages
    const top3Languages = sortedLanguages.slice(0, 3);
    const languageStrings = top3Languages.map((lang) => `${lang.name} (${lang.percentage}%)`);

    return {
      topLanguages: languageStrings.length > 0 ? languageStrings.join(", ") : "N/A",
    };
  } catch (error: unknown) {
    if (error instanceof Error && process.env.NODE_ENV === "development") {
      console.error("Failed to fetch language stats:", error.message);
    }
    return { topLanguages: "N/A" };
  }
}
