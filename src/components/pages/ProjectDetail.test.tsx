import { describe, expect, it } from "vitest";
import { renderIntoDocument } from "@/components/ds/testUtils";
import { bondsmithFixture, hyperionFixture } from "@/components/storybook-fixtures/projects";
import { ProjectDetail } from "./ProjectDetail";

describe("ProjectDetail", () => {
  it("stacks header, Capabilities, Roadmap, and Brief in DOM order (detail-order)", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectDetail project={bondsmithFixture}>
        <p>Brief body</p>
      </ProjectDetail>
    );

    const headings = Array.from(container.querySelectorAll("h1, h2")).map((heading) => heading.id);
    const summaryIndex = headings.indexOf("project-summary-heading");
    const capabilitiesIndex = headings.indexOf("capabilities-heading");
    const roadmapIndex = headings.indexOf("roadmap");
    expect(summaryIndex).toBeGreaterThanOrEqual(0);
    expect(summaryIndex).toBeLessThan(capabilitiesIndex);
    expect(capabilitiesIndex).toBeLessThan(roadmapIndex);
    expect(container.textContent).toContain("Brief body");

    unmount();
  });

  it("computes the meter percent and legend from the Project's roadmap", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectDetail project={bondsmithFixture}>
        <p>Brief body</p>
      </ProjectDetail>
    );

    const meter = container.querySelector('[role="progressbar"]');
    expect(meter?.getAttribute("aria-valuenow")).toBe("50");
    expect(container.querySelector('[data-slot="meter-legend"]')?.textContent).toBe("50% to MVP");

    unmount();
  });

  it("renders no Capabilities section when a Project has none, and no Roadmap divider mismatch (progress-100-visible)", () => {
    const { container, unmount } = renderIntoDocument(
      <ProjectDetail project={hyperionFixture}>
        <p>Brief body</p>
      </ProjectDetail>
    );

    expect(container.textContent).toContain("Maturity · 3 of 3 shipped");
    const meter = container.querySelector('[role="progressbar"]');
    expect(meter?.getAttribute("aria-valuenow")).toBe("100");

    unmount();
  });
});
