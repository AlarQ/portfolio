import { type RefObject, useEffect, useRef } from "react";

/**
 * Accessibility behaviors for a modal drawer: close on Escape, lock body
 * scroll while open, and move focus to the first link on open. Extracted from
 * rendering so the generic drawer a11y is one named seam rather than three
 * inline effects tangled into the markup.
 *
 * Attach the returned ref to the element whose first `<a>` should receive
 * focus when the drawer opens.
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

  // Focus first link when drawer opens
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Small delay to ensure drawer is rendered
      setTimeout(() => {
        const firstLink = containerRef.current?.querySelector("a");
        firstLink?.focus();
      }, 100);
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
