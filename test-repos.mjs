import { fetchTwoYearContributions } from "./src/lib/github.ts";

async function test() {
  console.log("Fetching 2-year contribution data...\n");

  const result = await fetchTwoYearContributions("AlarQ");

  console.log("=== 2-Year Statistics ===");
  console.log(`Total Commits: ${result.twoYearStats.totalCommitContributions}`);
  console.log(`Total PRs: ${result.twoYearStats.totalPullRequestContributions}`);
  console.log(`Active Repositories: ${result.twoYearStats.totalRepositoryContributions}`);
  console.log(`Total Contributions: ${result.twoYearStats.totalContributions}`);
}

test().catch(console.error);
