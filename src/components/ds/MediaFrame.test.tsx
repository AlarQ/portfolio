import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MediaFrame } from "./MediaFrame";
import { renderIntoDocument } from "./testUtils";

describe("MediaFrame", () => {
  it("renders an img with the given alt text, no border/shadow on the media itself", () => {
    const { container, unmount } = renderIntoDocument(
      <MediaFrame src="/media/fixtures/poster.webp" alt="A diagram." />
    );

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("alt")).toBe("A diagram.");
    expect(img?.className).not.toMatch(/border|shadow/);

    unmount();
  });

  it("wraps the media in a bordered, clipped, aspect-video frame using semantic tokens", () => {
    const { container, unmount } = renderIntoDocument(
      <MediaFrame src="/media/fixtures/poster.webp" alt="A diagram." />
    );

    const frame = container.firstElementChild;
    expect(frame?.className).toContain("aspect-video");
    expect(frame?.className).toContain("border-border");
    expect(frame?.className).toContain("bg-muted");
    expect(frame?.className).not.toMatch(/#|rgb\(|hsl\(|\[#/);

    unmount();
  });

  it("caps the frame height at 200px from md: up (FR-9)", () => {
    const { container, unmount } = renderIntoDocument(
      <MediaFrame src="/media/fixtures/poster.webp" alt="A diagram." />
    );

    const frame = container.firstElementChild;
    expect(frame?.className).toContain("md:max-h-[200px]");

    unmount();
  });

  it("dark-frame-border: `border-border`'s computed color differs between light and dark theme, neither transparent", () => {
    // MediaFrame's frame binds the semantic `border-border` class (asserted
    // above); the class itself only takes effect once Tailwind's compiled
    // CSS is loaded (not the case in this jsdom unit), so this asserts the
    // token source of truth that class resolves to (`tokens.css`'s `:root`
    // vs `.dark` `--border`/`--color-border` values) actually differs - the
    // cheapest correct check that dark mode isn't silently reusing (or
    // losing, via `transparent`) the light-theme border color.
    const tokensCss = readFileSync(join(process.cwd(), "src/theme/tokens.css"), "utf-8");

    const rootBlock = tokensCss.match(/:root\s*{([^}]*)}/)?.[1] ?? "";
    const darkBlock = tokensCss.match(/\.dark\s*{([^}]*)}/)?.[1] ?? "";

    const lightBorder = rootBlock.match(/--border:\s*([^;]+);/)?.[1]?.trim();
    const darkBorder = darkBlock.match(/--border:\s*([^;]+);/)?.[1]?.trim();

    expect(lightBorder).toBeTruthy();
    expect(darkBorder).toBeTruthy();
    expect(darkBorder).not.toBe(lightBorder);
    expect(lightBorder).not.toBe("transparent");
    expect(darkBorder).not.toBe("transparent");
  });

  it("does not set priority by default", () => {
    const { container, unmount } = renderIntoDocument(
      <MediaFrame src="/media/fixtures/poster.webp" alt="A diagram." />
    );

    const img = container.querySelector("img");
    // next/image adds fetchPriority="high" only when priority is set
    expect(img?.getAttribute("fetchpriority")).not.toBe("high");

    unmount();
  });
});
