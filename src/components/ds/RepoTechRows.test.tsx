import { describe, expect, it } from "vitest";
import type { ProjectRepo } from "@/data/projects";
import { RepoTechRows } from "./RepoTechRows";
import { renderIntoDocument } from "./testUtils";

describe("RepoTechRows", () => {
  it("renders tech badges resolved via the techPresentation seam, not raw literals", () => {
    const repos: readonly ProjectRepo[] = [{ role: "frontend", techKeys: ["nextjs", "react"] }];
    const { container, unmount } = renderIntoDocument(<RepoTechRows repos={repos} />);

    const badges = container.querySelectorAll('[data-slot="badge"]');
    const categories = Array.from(badges).map((badge) => badge.getAttribute("data-category"));

    expect(categories).toContain("gray-blue"); // nextjs
    expect(categories).toContain("sky"); // react

    unmount();
  });

  it("omits the role-label gutter for a single-repo Project", () => {
    const repos: readonly ProjectRepo[] = [{ role: "frontend", techKeys: ["nextjs"] }];
    const { container, unmount } = renderIntoDocument(<RepoTechRows repos={repos} />);

    expect(container.textContent).not.toContain("Frontend");
    expect(container.textContent).not.toContain("Backend");

    unmount();
  });

  it("renders the role-label gutter for a multi-repo Project", () => {
    const repos: readonly ProjectRepo[] = [
      { role: "frontend", techKeys: ["nextjs"] },
      { role: "backend", techKeys: ["rust"] },
    ];
    const { container, unmount } = renderIntoDocument(<RepoTechRows repos={repos} />);

    expect(container.textContent).toContain("Frontend");
    expect(container.textContent).toContain("Backend");

    unmount();
  });

  it("renders nothing when there are no repos", () => {
    const { container, unmount } = renderIntoDocument(<RepoTechRows repos={[]} />);

    expect(container.firstChild).toBeNull();

    unmount();
  });
});
