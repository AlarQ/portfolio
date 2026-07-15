import { describe, expect, it } from "vitest";
import { IdentityRail } from "./IdentityRail";
import { renderIntoDocument } from "./testUtils";

const PORTRAIT = { src: "/images/profile.jpg", alt: "Ernest Bednarczyk" };

const BASE_PROPS = {
  portrait: PORTRAIT,
  name: "Ernest Bednarczyk",
  title: "SOFTWARE ENGINEER",
  subtitle: "TEAM LEADER",
} as const;

describe("IdentityRail", () => {
  it("renders the portrait and injected name/title/subtitle", () => {
    const { container, unmount } = renderIntoDocument(<IdentityRail {...BASE_PROPS} />);

    expect(container.querySelector(`img[alt="${PORTRAIT.alt}"]`)).not.toBeNull();
    expect(container.querySelector('[data-slot="identity-rail"]')).not.toBeNull();
    expect(container.textContent).toContain(BASE_PROPS.name);
    expect(container.textContent).toContain(BASE_PROPS.title);
    expect(container.textContent).toContain(BASE_PROPS.subtitle);

    unmount();
  });
});
