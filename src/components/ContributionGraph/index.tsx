import { Box, Paper, Skeleton, Typography } from "@mui/material";
import { calculateStats, fetchTwoYearContributions } from "@/lib/github";
import { ContributionGraph as ContributionGraphClient } from "./ContributionGraph";

interface ContributionGraphContainerProps {
  username: string;
}

export async function ContributionGraph({ username }: ContributionGraphContainerProps) {
  try {
    // Fetch 2-year stats, recent calendar, and language data
    const { twoYearStats, recentCalendar, topLanguages } =
      await fetchTwoYearContributions(username);

    // Calculate stats using both 2-year and recent data, including languages
    const stats = calculateStats(twoYearStats, recentCalendar, topLanguages);

    // Pass 2-year data for heatmap visualization (shows 2025 + 2026)
    return <ContributionGraphClient data={twoYearStats} stats={stats} />;
  } catch (error) {
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

export function ContributionGraphSkeleton() {
  const generateCellId = (weekNum: number, dayNum: number) =>
    `skeleton-cell-w${weekNum}-d${dayNum}`;

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
      <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />

      <Skeleton variant="text" width={250} height={20} sx={{ mb: 3 }} />

      <Box sx={{ display: "flex", gap: 4, mb: 1 }}>
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
          (month) => (
            <Skeleton key={`month-${month}`} variant="text" width={30} height={14} />
          )
        )}
      </Box>

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

export { ContributionGraphClient };
