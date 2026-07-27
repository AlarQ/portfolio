import { type RefObject, useEffect, useRef } from "react";

/**
 * Accessibility behaviors for a modal drawer: close on Escape, lock body
 * scroll while open, and move focus to the first link on open. Extracted from
 * rendering so the generic drawer a11y is one named seam rather than three
 * inline effects tangled into the markup.
 *
 * Attach the returned ref to the drawer panel itself (`tabIndex={-1}`): focus
 * lands on the panel, not on its first link. Focusing a link programmatically
 * makes Safari paint its UA focus ring around that link on plain touch opens,
 * which reads as a stray blue box; the panel carries `focus:outline-none`.
 */
export function useDrawerA11y(
  isOpen: boolean,
  onClose: () => void
): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Move focus into the drawer when it opens
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Small delay to ensure drawer is rendered
      const timer = setTimeout(() => {
        containerRef.current?.focus({ preventScroll: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return containerRef;
}
