import { act } from "react";
import { createRoot } from "react-dom/client";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Shared test helper for the `ds/` molecule suite. Mounts a React element
 * into a real DOM container via `react-dom/client`, wrapped in `act`, so
 * tests can assert against rendered shadcn primitive markup (`data-slot`
 * attributes) without pulling in `@testing-library/react` (not a project
 * dependency).
 */
export function renderIntoDocument(node: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(node);
  });
  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}
