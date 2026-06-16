"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { navItems } from "@/data/navItems";
import { nameGradient } from "@/utils/navPresentation";
import { LogoTile } from "./LogoTile";
import { NavLink } from "./NavLink";

export function DesktopNav() {
  return (
    <Box
      component="nav"
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Logo/Name */}
      <Box
        component={Link}
        href="/blog"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          textDecoration: "none",
        }}
      >
        <LogoTile size="lg" />
        <Typography
          variant="h6"
          data-testid="nav-logo-name"
          sx={{
            fontFamily: "var(--font-orbitron), sans-serif",
            fontWeight: 600,
            fontSize: "1rem",
            letterSpacing: "0.08em",
            background: nameGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Ernest Bednarczyk
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* Navigation Links */}
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} />
        ))}
      </Box>
    </Box>
  );
}
