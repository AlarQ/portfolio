"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  const theme = useTheme();

  return (
    <IconButton
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      sx={{
        padding: 1,
        "&:hover": {
          backgroundColor: "rgba(14, 165, 233, 0.1)",
        },
      }}
    >
      <Box
        sx={{
          width: 24,
          height: 20,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top line */}
        <Box
          component={motion.span}
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 8 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          sx={{
            width: "100%",
            height: 2,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1,
            transformOrigin: "center",
          }}
        />

        {/* Middle line */}
        <Box
          component={motion.span}
          animate={{
            opacity: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          sx={{
            width: "100%",
            height: 2,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1,
          }}
        />

        {/* Bottom line */}
        <Box
          component={motion.span}
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -8 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          sx={{
            width: "100%",
            height: 2,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1,
            transformOrigin: "center",
          }}
        />
      </Box>
    </IconButton>
  );
}
