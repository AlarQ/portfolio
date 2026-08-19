import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Listener = (event: MediaQueryListEvent) => void;

function stubMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<Listener>();

  const mql = {
    get matches() {
      return matches;
    },
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
  };

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql)
  );

  return {
    setMatches(next: boolean) {
      matches = next;
      for (const listener of listeners) listener({} as MediaQueryListEvent);
    },
    listenerCount: () => listeners.size,
  };
}

function Probe({ serverSnapshot }: { serverSnapshot?: boolean }) {
  const reduced = usePrefersReducedMotion(serverSnapshot);
  return <span data-testid="value">{String(reduced)}</span>;
}

function mount(ui: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePrefersReducedMotion", () => {
  it("reflects the current matchMedia value on the client", () => {
    stubMatchMedia(true);

    const { container, unmount } = mount(<Probe />);

    expect(container.querySelector('[data-testid="value"]')?.textContent).toBe("true");
    unmount();
  });

  it("defaults serverSnapshot to false when the client also reports no preference", () => {
    stubMatchMedia(false);

    const { container, unmount } = mount(<Probe />);

    expect(container.querySelector('[data-testid="value"]')?.textContent).toBe("false");
    unmount();
  });

  it("updates when the media query change event fires", () => {
    const stub = stubMatchMedia(false);

    const { container, unmount } = mount(<Probe />);
    expect(container.querySelector('[data-testid="value"]')?.textContent).toBe("false");

    act(() => {
      stub.setMatches(true);
    });

    expect(container.querySelector('[data-testid="value"]')?.textContent).toBe("true");
    unmount();
  });

  it("removes its change listener on unmount", () => {
    const stub = stubMatchMedia(false);

    const { unmount } = mount(<Probe />);
    expect(stub.listenerCount()).toBeGreaterThan(0);

    unmount();

    expect(stub.listenerCount()).toBe(0);
  });
});
