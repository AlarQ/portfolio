/**
 * ContributionGraph Client Component
 *
 * This is a Client Component (marked with 'use client') that renders the
 * interactive contribution grid and stats panel. It receives pre-fetched data
 * from the Server Component and handles all client-side interactivity.
 *
 * Key concepts demonstrated:
 * - Client Components with MUI for interactivity
 * - CSS Grid for layout
 * - MUI Tooltip for hover information
 * - Responsive design with overflow scrolling
 * - Theme integration with MUI
 */

"use client";

import { Box, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import { formatContributionCount, formatContributionDate } from "@/lib/github";
import type {
  ContributionCalendar,
  ContributionStats as ContributionStatsType,
} from "@/types/contributions";
import { ContributionStats } from "./ContributionStats";

interface ContributionGraphProps {
  data: ContributionCalendar;
  stats: ContributionStatsType;
}

/**
 * Maps light theme colors from GitHub API to dark theme colors
 * GitHub API returns light theme colors by default, so we need to convert them
 *
 * @param color - Hex color code from GitHub API (light theme)
 * @returns Hex color code for dark theme
 */
function getContributionColor(color: string): string {
  if (!color || color === "") {
    return "#161b22";
  }

  const colorMap: Record<string, string> = {
    "#ebedf0": "#161b22",
    "#9be9a8": "#0e4429",
    "#40c463": "#006d32",
    "#30a14e": "#26a641",
    "#216e39": "#39d353",
  };

  return colorMap[color] || color;
}

/**
 * Gets month labels with proper positioning
 * Returns an array of 53 elements (one for each week column)
 * where each element is either a month label or null
 */
function getMonthLabelRow(weeks: ContributionCalendar["weeks"]): Array<string | null> {
  const row: Array<string | null> = new Array(53).fill(null);
  let lastMonth: number | null = null;

  weeks.forEach((week, weekIndex) => {
    if (weekIndex >= 53) return;

    // Get the first day of the week
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;

    const date = new Date(firstDay.date);
    const month = date.getMonth();

    // Only add label when month changes
    if (month !== lastMonth) {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      row[weekIndex] = monthNames[month];
      lastMonth = month;
    }
  });

  return row;
}

/**
 * GitHub's official contribution colors for the legend
 * These match exactly what GitHub displays
 */
const GITHUB_CONTRIBUTION_COLORS = {
  0: "#161b22",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

export function ContributionGraph({ data, stats }: ContributionGraphProps) {
  const theme = useTheme();
  const monthLabelRow = getMonthLabelRow(data.weeks);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.2fr) minmax(0, 0.8fr)" },
        gap: 3,
      }}
    >
      {/* Left side: Contribution Graph */}
      <Box>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          {/* Header with title and total count */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              GitHub Contributions
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                mt: 0.5,
              }}
            >
              {formatContributionCount(data.totalContributions)} in the last year
            </Typography>
          </Box>

          {/* Scrollable container for the grid */}
          <Box
            data-testid="contribution-graph"
            sx={{
              overflowX: "auto",
              overflowY: "hidden",
              pb: 1,
              scrollBehavior: "smooth",
              "&::-webkit-scrollbar": {
                height: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: theme.palette.background.default,
                borderRadius: "3px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: theme.palette.divider,
                borderRadius: "3px",
              },
            }}
          >
            {/* Main grid container */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(data.weeks.length, 53)}, 12px)`,
                gridTemplateRows: "auto repeat(7, 12px)",
                gap: "3px",
                minWidth: "max-content",
              }}
            >
              {/* Month labels row */}
              {monthLabelRow.map((label, index) => {
                const labelKey = label ? `month-${label}-col-${index}` : `empty-col-${index}`;
                return (
                  <Box
                    key={labelKey}
                    sx={{
                      gridRow: 1,
                      gridColumn: index + 1,
                      fontSize: "10px",
                      color: theme.palette.text.secondary,
                      height: "14px",
                      lineHeight: "14px",
                      visibility: label ? "visible" : "hidden",
                    }}
                  >
                    {label || "\u00A0"}
                  </Box>
                );
              })}

              {/* Contribution days grid - organized by week columns */}
              {data.weeks.slice(0, 53).map((week, weekIndex) =>
                week.contributionDays.map((day, dayIndex) => {
                  const color = getContributionColor(day.color);

                  return (
                    <Tooltip
                      key={day.date}
                      title={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatContributionCount(day.contributionCount)}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {formatContributionDate(day.date)}
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="top"
                      slotProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            border: `1px solid ${theme.palette.divider}`,
                            "& .MuiTooltip-arrow": {
                              color: theme.palette.background.paper,
                            },
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: color,
                          borderRadius: "2px",
                          cursor: "pointer",
                          transition: "all 0.15s ease-in-out",
                          gridColumn: weekIndex + 1,
                          gridRow: dayIndex + 2,
                          "&:hover": {
                            filter: "brightness(1.3)",
                            transform: "scale(1.15)",
                            zIndex: 1,
                          },
                        }}
                        aria-label={`${formatContributionCount(day.contributionCount)} on ${formatContributionDate(day.date)}`}
                        role="img"
                      />
                    </Tooltip>
                  );
                })
              )}
            </Box>
          </Box>

          {/* Legend */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
              mt: 2,
              fontSize: "11px",
              color: theme.palette.text.secondary,
            }}
          >
            <Typography variant="caption">Less</Typography>
            {[0, 1, 2, 3, 4].map((level) => (
              <Box
                key={level}
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor:
                    GITHUB_CONTRIBUTION_COLORS[level as keyof typeof GITHUB_CONTRIBUTION_COLORS],
                  borderRadius: "2px",
                }}
              />
            ))}
            <Typography variant="caption">More</Typography>
          </Box>
        </Paper>
      </Box>

      {/* Right side: Stats Panel */}
      <Box>
        <ContributionStats stats={stats} />
      </Box>
    </Box>
  );
}
