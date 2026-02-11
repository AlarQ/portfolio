"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { NavLink } from "./NavLink";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
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
      <Box
        component={Link}
        href="/"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          textDecoration: "none",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(14, 165, 233, 0.4)",
          }}
        >
          EB
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "var(--font-orbitron), sans-serif",
            fontWeight: 600,
            fontSize: "1rem",
            letterSpacing: "0.08em",
            background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
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
