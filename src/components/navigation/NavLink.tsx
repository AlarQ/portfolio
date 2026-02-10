"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
  external?: boolean;
  onClick?: () => void;
}

export function NavLink({ href, label, external = false, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const theme = useTheme();

  // Determine if this link is active
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkContent = (
    <Box
      component={motion.span}
      whileHover={{ scale: 1.05, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      sx={{
        position: "relative",
        display: "inline-block",
        color: isActive ? "#38bdf8" : "#0ea5e9",
        textTransform: "uppercase",
        fontWeight: 700,
        fontSize: { xs: "0.8125rem", sm: "0.9375rem" },
        letterSpacing: "0.05em",
        opacity: 1,
        cursor: "pointer",
        textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
        transition: "color 0.2s ease, transform 0.2s ease",
        "&:hover": {
          color: "#7dd3fc",
          transform: "translateY(-1px)",
        },
        // Active indicator - animated underline
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -4,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: theme.palette.primary.main,
          transform: isActive ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 0.3s ease",
        },
      }}
    >
      {label}
    </Box>
  );

  if (external) {
    return (
      <Box
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
        sx={{
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        {linkContent}
      </Box>
    );
  }

  return (
    <Box
      component={Link}
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      sx={{
        textDecoration: "none",
        display: "inline-block",
      }}
    >
      {linkContent}
    </Box>
  );
}
