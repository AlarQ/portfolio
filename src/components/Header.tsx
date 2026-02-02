"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Link from "next/link";

export function Header() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: 16, sm: 24 },
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "100%",
        maxWidth: { xs: "calc(100% - 32px)", sm: "calc(100% - 48px)", md: 1200 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            color: theme.palette.common.white,
            fontWeight: 500,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Ernest Bednarczyk
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
          <Button
            component={Link}
            href="/"
            sx={{
              color: theme.palette.primary.main,
              textTransform: "uppercase",
              fontWeight: 500,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "&:hover": {
                backgroundColor: "transparent",
                color: theme.palette.primary.light,
              },
            }}
          >
            Home
          </Button>
          <Button
            component={Link}
            href="/blog"
            sx={{
              color: theme.palette.primary.main,
              textTransform: "uppercase",
              fontWeight: 500,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "&:hover": {
                backgroundColor: "transparent",
                color: theme.palette.primary.light,
              },
            }}
          >
            Blog
          </Button>
          <Button
            component={Link}
            href="/projects"
            sx={{
              color: theme.palette.primary.main,
              textTransform: "uppercase",
              fontWeight: 500,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "&:hover": {
                backgroundColor: "transparent",
                color: theme.palette.primary.light,
              },
            }}
          >
            Projects
          </Button>
          <Button
            component="a"
            href="/cv/Ernest_Bednarczyk_CV_01_2025.pdf"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: theme.palette.primary.main,
              textTransform: "uppercase",
              fontWeight: 500,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "&:hover": {
                backgroundColor: "transparent",
                color: theme.palette.primary.light,
              },
            }}
          >
            Resume
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
