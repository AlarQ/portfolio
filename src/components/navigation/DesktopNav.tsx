"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { NavLink } from "./NavLink";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/cv/Ernest_Bednarczyk_CV_01_2025.pdf", label: "Resume", external: true },
];

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
      <Typography
        variant="h6"
        component="div"
        sx={{
          color: "#ffffff",
          fontWeight: 700,
          fontSize: "1.25rem",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
        }}
      >
        Ernest Bednarczyk
      </Typography>

      <Box sx={{ flexGrow: 1 }} />

      {/* Navigation Links */}
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} external={item.external} />
        ))}
      </Box>
    </Box>
  );
}
