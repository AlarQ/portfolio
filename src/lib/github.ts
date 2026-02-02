import type {
  ContributionCalendar,
  ContributionStats,
  GitHubContributionsResponse,
  RepositoryLineCountsResponse,
} from "@/types/contributions";

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

const GET_REPOSITORIES_QUERY = `
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

export function calculateStats(data: ContributionCalendar): ContributionStats {
  return {
    totalCommits: data.totalCommitContributions,
    totalPullRequests: data.totalPullRequestContributions,
    activeRepositories: data.totalRepositoryContributions,
    currentStreak: calculateCurrentStreak(data.weeks),
    longestStreak: calculateLongestStreak(data.weeks),
    mostActiveDay: calculateMostActiveDay(data.weeks),
    totalLinesOfCode: "0",
    linesByLanguage: "N/A",
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

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

export async function fetchRepositoryLineCounts(username: string): Promise<{
  totalLinesOfCode: string;
  linesByLanguage: string;
}> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return { totalLinesOfCode: "0", linesByLanguage: "N/A" };
  }

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_REPOSITORIES_QUERY,
        variables: { username },
      }),
      next: {
        revalidate: 21600,
        tags: ["github-repositories"],
      },
    });

    if (!response.ok) {
      return { totalLinesOfCode: "0", linesByLanguage: "N/A" };
    }

    const result: RepositoryLineCountsResponse | { errors: Array<{ message: string }> } =
      await response.json();

    if ("errors" in result && result.errors) {
      if (process.env.NODE_ENV === "development") {
        console.error("GitHub GraphQL error:", result.errors[0]?.message);
      }
      return { totalLinesOfCode: "0", linesByLanguage: "N/A" };
    }

    if (!("data" in result) || !result.data?.user?.repositories?.nodes) {
      return { totalLinesOfCode: "0", linesByLanguage: "N/A" };
    }

    const repositories = result.data.user.repositories.nodes;

    const languageTotals = new Map<string, number>();

    for (const repo of repositories) {
      for (const langEdge of repo.languages.edges) {
        const langName = langEdge.node.name;
        const bytes = langEdge.size;
        languageTotals.set(langName, (languageTotals.get(langName) || 0) + bytes);
      }
    }

    const totalBytes = Array.from(languageTotals.values()).reduce((sum, val) => sum + val, 0);
    const totalLines = Math.round(totalBytes / 40);

    const sortedLanguages = Array.from(languageTotals.entries())
      .map(([name, bytes]) => ({ name, bytes, lines: Math.round(bytes / 40) }))
      .sort((a, b) => b.lines - a.lines);

    const top3Languages = sortedLanguages.slice(0, 3);
    const languageStrings = top3Languages.map(
      (lang) => `${lang.name} (${formatNumber(lang.lines)})`
    );

    const linesByLanguage = languageStrings.length > 0 ? languageStrings.join(", ") : "N/A";

    return {
      totalLinesOfCode: formatNumber(totalLines),
      linesByLanguage,
    };
  } catch (error: unknown) {
    if (error instanceof Error && process.env.NODE_ENV === "development") {
      console.error("Failed to fetch repository line counts:", error.message);
    }
    return { totalLinesOfCode: "0", linesByLanguage: "N/A" };
  }
}
