"use client";

import { Box, Typography, useTheme } from "@mui/material";
import type { Skill } from "@/data/skills";
import { skillCategoryColors } from "@/data/skills";
import { getSkillIcon } from "@/utils/skillIcons";

interface SkillsGridProps {
  skills: readonly Skill[];
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
  };
  groupByCategory?: boolean;
}

export function SkillsGrid({
  skills,
  columns = { xs: 1, sm: 2, md: 2 },
  groupByCategory = false,
}: SkillsGridProps) {
  const theme = useTheme();

  const renderSkillItem = (skill: Skill) => {
    const categoryColor = skillCategoryColors[skill.category];

    return (
      <Box
        key={skill.name}
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1.5,
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateX(2px)",
          },
        }}
      >
        {/* Icon box following ContributionStats pattern */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            backgroundColor: `${categoryColor}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            "& svg": {
              color: categoryColor,
              fontSize: "1.5rem",
              fontWeight: 700,
            },
          }}
        >
          {getSkillIcon(skill.name)}
        </Box>

        {/* Skill name */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.875rem",
              lineHeight: 1.3,
            }}
          >
            {skill.name}
          </Typography>
        </Box>
      </Box>
    );
  };

  if (groupByCategory) {
    // Group skills by category
    const groupedSkills = skills.reduce(
      (acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
      },
      {} as Record<string, Skill[]>
    );

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <Box key={category}>
            <Typography
              variant="subtitle2"
              sx={{
                color: skillCategoryColors[category as keyof typeof skillCategoryColors],
                fontWeight: 600,
                mb: 2,
              }}
            >
              {category}
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: `repeat(${columns.xs || 1}, 1fr)`,
                  sm: `repeat(${columns.sm || 2}, 1fr)`,
                  md: `repeat(${columns.md || 3}, 1fr)`,
                },
                gap: 2,
              }}
            >
              {categorySkills.map(renderSkillItem)}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // Simple grid without category grouping
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: `repeat(${columns.xs || 1}, 1fr)`,
          sm: `repeat(${columns.sm || 2}, 1fr)`,
          md: `repeat(${columns.md || 3}, 1fr)`,
        },
        gap: 2,
      }}
    >
      {skills.map(renderSkillItem)}
    </Box>
  );
}
