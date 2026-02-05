"use client";

import { Box, Container, Grid, Typography } from "@mui/material";
import { useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import type { Project } from "@/data/projects";
import { projects } from "@/data/projects";

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleSelectProject = (project: Project) => {
    setSelectedProject((current) => (current?.id === project.id ? null : project));
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 4, md: 8 },
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          fontWeight: 700,
          mb: { xs: 3, md: 5 },
          textAlign: "center",
        }}
      >
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
