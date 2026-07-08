"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { NavItem } from "@/data/navItems";
import { useDrawerA11y } from "@/hooks/useDrawerA11y";
import { ThemePill } from "./ThemePill";

/**
 * Client child of the `ds/Header` organism: the mobile hamburger trigger plus
 * its slide-in drawer. Isolates all interactivity (`useState`, portal) here so
 * `Header` itself stays a presentational server component.
 *
 * Presentational contract mirrors Header's desktop nav — semantic Tailwind
 * classes only (no raw hex/palette; the fixed `bg-black/50` scrim is the one
 * intentional theme-neutral color), `lucide-react` icons, and the same
 * visual-only `aria-hidden` theme pill (next-themes wiring stays deferred).
 */
export interface HeaderMobileMenuProps {
  items: readonly NavItem[];
  activeHref?: string;
}

export function HeaderMobileMenu({ items, activeHref }: HeaderMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Restore focus to the trigger on close (Escape / scrim / link), the other
  // half of the focus contract `useDrawerA11y` starts by focusing the first
  // link on open — without it a keyboard/AT user is dropped to `document.body`.
  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const firstLinkRef = useDrawerA11y(isOpen, closeDrawer);

  // The drawer stays mounted (once `mounted`) so the panel can transition
  // between its off-screen and open positions — a slide, not a pop. `isOpen`
  // only toggles the translate/opacity classes. When closed the panel is
  // `inert` + `aria-hidden`, keeping its links out of tab order and off the
  // a11y tree despite being in the DOM.
  const drawerContent = (
    <>
      {/* Fixed dark scrim — theme-neutral by design. */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
        aria-hidden
      />
      <div
        id="header-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!isOpen}
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex w-[80%] max-w-[320px] flex-col gap-8 bg-background px-6 pt-8 text-foreground transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={closeDrawer}
          aria-label="Close menu"
          className="self-end text-foreground"
        >
          <X className="size-8" />
        </button>
        <div ref={firstLinkRef} className="flex flex-col gap-2">
          {items.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={closeDrawer}
                className={`flex min-h-12 items-center text-xl leading-6 text-foreground no-underline ${
                  active ? "border-b border-foreground font-bold" : "font-normal"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <ThemePill className="mt-auto mb-8 w-fit" />
      </div>
    </>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="header-mobile-menu"
        className="text-foreground"
      >
        {/* Always the hamburger: when open the panel covers this trigger, and
            the drawer's own X is the sole visible close affordance. Open/close
            state is conveyed to AT via aria-label + aria-expanded, not the icon. */}
        <Menu className="size-8" />
      </button>
      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
