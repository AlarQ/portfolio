#!/usr/bin/env node

/**
 * Script to fetch GitHub contributions for January 2026
 *
 * This script calls the GitHub GraphQL API and displays the contribution
 * count for each day in January 2026.
 *
 * Usage:
 *   npx ts-node scripts/fetch-january-contributions.ts
 *
 * Or make it executable:
 *   chmod +x scripts/fetch-january-contributions.ts
 *   ./scripts/fetch-january-contributions.ts
 */

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "AlarQ";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("❌ Error: GITHUB_TOKEN not found in .env.local");
  console.error("Please add your GitHub Personal Access Token to .env.local");
  process.exit(1);
}

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

interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

async function fetchContributions(): Promise<void> {
  console.log(`🔍 Fetching contributions for ${GITHUB_USERNAME}...\n`);

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: GET_CONTRIBUTIONS_QUERY,
        variables: { username: GITHUB_USERNAME },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL Error: ${result.errors[0]?.message}`);
    }

    const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      throw new Error("No contribution data found");
    }

    // Flatten all days and filter for January 2026
    const allDays: ContributionDay[] = [];
    calendar.weeks.forEach((week: { contributionDays: ContributionDay[] }) => {
      week.contributionDays.forEach((day: ContributionDay) => {
        allDays.push(day);
      });
    });

    // Filter for January 2026 (dates starting with "2026-01-")
    const januaryDays = allDays.filter((day) => day.date.startsWith("2026-01-"));

    console.log("📅 GitHub Contributions for January 2026");
    console.log("═".repeat(50));
    console.log();

    let totalJanuaryContributions = 0;

    // Group by week for better readability
    const weeks: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];

    januaryDays.forEach((day, _index) => {
      const dayOfWeek = new Date(day.date).getDay(); // 0 = Sunday

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }

      currentWeek.push(day);
      totalJanuaryContributions += day.contributionCount;
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Display each week
    weeks.forEach((week, weekIndex) => {
      console.log(`\n📌 Week ${weekIndex + 1}:`);
      console.log("-".repeat(50));

      week.forEach((day) => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        const dateFormatted = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        const countStr = day.contributionCount.toString().padStart(2, " ");
        const contributionWord = day.contributionCount === 1 ? "contribution" : "contributions";

        // Show visual indicator of activity level
        const activityIndicator =
          day.contributionCount === 0
            ? "⬜"
            : day.contributionCount < 5
              ? "🟩"
              : day.contributionCount < 15
                ? "🟩🟩"
                : day.contributionCount < 25
                  ? "🟩🟩🟩"
                  : "🟩🟩🟩🟩";

        console.log(
          `  ${dayName.padEnd(10)} ${dateFormatted.padEnd(8)} | ` +
            `${countStr} ${contributionWord.padEnd(13)} | ${activityIndicator}`
        );
      });
    });

    console.log(`\n${"═".repeat(50)}`);
    console.log(`📊 Total January 2026 Contributions: ${totalJanuaryContributions}`);
    console.log(`📊 Total Last Year Contributions: ${calendar.totalContributions}`);
    console.log();

    // Show summary by contribution level
    console.log("\n📈 Contribution Breakdown:");
    const levelCounts = {
      "No activity (0)": januaryDays.filter((d) => d.contributionCount === 0).length,
      "Low (1-9)": januaryDays.filter((d) => d.contributionCount >= 1 && d.contributionCount <= 9)
        .length,
      "Medium (10-19)": januaryDays.filter(
        (d) => d.contributionCount >= 10 && d.contributionCount <= 19
      ).length,
      "High (20-29)": januaryDays.filter(
        (d) => d.contributionCount >= 20 && d.contributionCount <= 29
      ).length,
      "Very High (30+)": januaryDays.filter((d) => d.contributionCount >= 30).length,
    };

    Object.entries(levelCounts).forEach(([level, count]) => {
      if (count > 0) {
        console.log(`  ${level}: ${count} days`);
      }
    });

    console.log();
  } catch (error) {
    console.error("❌ Error fetching contributions:", error);
    process.exit(1);
  }
}

// Run the script
fetchContributions();
