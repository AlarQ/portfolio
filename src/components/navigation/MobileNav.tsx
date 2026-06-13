"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { navItems } from "@/data/navItems";
import { useDrawerA11y } from "@/hooks/useDrawerA11y";
import { brand } from "@/theme/theme";
import { drawerShadow, nameGradient } from "@/utils/navPresentation";
import { HamburgerButton } from "./HamburgerButton";
import { LogoTile } from "./LogoTile";
import { NavLink } from "./NavLink";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const firstLinkRef = useDrawerA11y(isOpen, closeDrawer);

  const drawerVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <Box
            component={motion.div}
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={closeDrawer}
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: brand.scrim,
              zIndex: 1200,
            }}
          />

          {/* Drawer */}
          <Box
            component={motion.div}
            id="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={drawerVariants}
            sx={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "80%",
              maxWidth: 320,
              backgroundColor: brand.paperOverlay95,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: drawerShadow,
              zIndex: 1300,
              display: "flex",
              flexDirection: "column",
              pt: 8,
              px: 4,
            }}
          >
            {/* Navigation Links */}
            <Box
              ref={firstLinkRef}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {navItems.map((item, index) => (
                <Box
                  key={item.href}
                  component={motion.div}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  sx={{
                    minHeight: 48, // Large touch target
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <NavLink href={item.href} label={item.label} onClick={closeDrawer} />
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
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
          <LogoTile size="sm" />
          <Typography
            variant="h6"
            data-testid="nav-logo-name"
            sx={{
              fontFamily: "var(--font-orbitron), sans-serif",
              fontWeight: 600,
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
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

        {/* Hamburger Button */}
        <HamburgerButton isOpen={isOpen} onClick={toggleDrawer} />
      </Box>

      {/* Render drawer in portal to avoid z-index issues */}
      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
