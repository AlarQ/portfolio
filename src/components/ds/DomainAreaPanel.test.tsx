import { describe, expect, it } from "vitest";
import type { DomainArea } from "@/data/domains";
import { DomainAreaPanel } from "./DomainAreaPanel";
import { renderIntoDocument } from "./testUtils";

const DOMAIN: DomainArea = {
  id: "leadership",
  name: "Leadership",
  headline: "I lead engineering teams.",
  achievements: [
    { id: "a1", description: "Led teams of up to eight engineers." },
    { id: "a2", description: "Shipped a cross-team project to production." },
  ],
  skills: [
    { name: "Team leadership", level: "expert", years: 3 },
    { name: "Mentoring", level: "proficient" },
  ],
};

describe("DomainAreaPanel", () => {
  it("composes the AreaHeadlineCard and renders every achievement and skill", () => {
    const { container, unmount } = renderIntoDocument(<DomainAreaPanel domain={DOMAIN} />);

    expect(container.querySelector('[data-slot="domain-area-panel"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="area-headline-card"]')).not.toBeNull();
    expect(container.textContent).toContain(DOMAIN.name);
    expect(container.textContent).toContain(DOMAIN.headline);
    for (const achievement of DOMAIN.achievements) {
      expect(container.textContent).toContain(achievement.description);
    }
    for (const skill of DOMAIN.skills) {
      expect(container.textContent).toContain(skill.name);
    }

    unmount();
  });

  it("renders a skill's optional years", () => {
    const { container, unmount } = renderIntoDocument(<DomainAreaPanel domain={DOMAIN} />);

    expect(container.textContent).toContain("3y");

    unmount();
  });

  it("resolves each skill's level to a Badge hue via the skillPresentation seam, not raw literals", () => {
    const { container, unmount } = renderIntoDocument(<DomainAreaPanel domain={DOMAIN} />);

    const categories = Array.from(container.querySelectorAll('[data-slot="badge"]')).map((badge) =>
      badge.getAttribute("data-category")
    );

    expect(categories).toContain("green"); // expert
    expect(categories).toContain("sky"); // proficient

    unmount();
  });

  it("omits the Achievements and Skills groups when empty, rather than rendering blank", () => {
    const { container, unmount } = renderIntoDocument(
      <DomainAreaPanel domain={{ ...DOMAIN, achievements: [], skills: [] }} />
    );

    expect(container.textContent).not.toContain("Achievements");
    expect(container.textContent).not.toContain("Skills");
    expect(container.querySelector('[data-slot="badge"]')).toBeNull();

    unmount();
  });
});
