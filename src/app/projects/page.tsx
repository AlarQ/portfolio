import { Container, Grid, Typography } from "@mui/material";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/data/projects";

export default function ProjectsPage() {
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
        {projects.map((project) => (
          <Grid key={project.id} size={{ xs: 12, md: 6 }}>
            <ProjectCard
              title={project.title}
              description={project.description}
              mvpProgress={project.mvpProgress}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
