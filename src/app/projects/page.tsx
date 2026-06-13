"use client";

import { Box, Container, Grid, Typography } from "@mui/material";
import { useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import type { Project } from "@/data/projects";
import { projects } from "@/data/projects";
import { pageShellSx, pageTitleSx } from "@/theme/layout";

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleSelectProject = (project: Project) => {
    setSelectedProject((current) => (current?.id === project.id ? null : project));
  };

  return (
    <Container maxWidth="xl" sx={pageShellSx}>
      <Typography variant="h1" sx={pageTitleSx}>
        My Projects
      </Typography>

      <Grid container spacing={{ xs: 3, md: 4 }}>
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                description={project.description}
                mvpProgress={project.mvpProgress}
                isExpanded={selectedProject?.id === project.id}
                onClick={() => handleSelectProject(project)}
              />
            ))}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <ProjectSidebar title={selectedProject?.title} githubUrl={selectedProject?.githubUrl} />
        </Grid>
      </Grid>
    </Container>
  );
}
