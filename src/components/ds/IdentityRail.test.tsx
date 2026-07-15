import { describe, expect, it } from "vitest";
import type { GalleryPhoto } from "@/data/profile";
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
    const { container, unmount } = renderIntoDocument(
      <IdentityRail {...BASE_PROPS} galleryPhotos={[]} />
    );

    expect(container.querySelector(`img[alt="${PORTRAIT.alt}"]`)).not.toBeNull();
    expect(container.querySelector('[data-slot="identity-rail"]')).not.toBeNull();
    expect(container.textContent).toContain(BASE_PROPS.name);
    expect(container.textContent).toContain(BASE_PROPS.title);
    expect(container.textContent).toContain(BASE_PROPS.subtitle);

    unmount();
  });

  it("renders a labeled placeholder tile for a gallery photo with no `src`", () => {
    const photo: GalleryPhoto = { alt: "My dog on a trail" };
    const { container, unmount } = renderIntoDocument(
      <IdentityRail {...BASE_PROPS} galleryPhotos={[photo]} />
    );

    // Placeholder branch: the alt text renders as visible label, no gallery <img>.
    expect(container.textContent).toContain(photo.alt);
    expect(container.querySelector(`img[alt="${photo.alt}"]`)).toBeNull();

    unmount();
  });

  it("renders an <img> for a gallery photo carrying a `src`", () => {
    const photo: GalleryPhoto = { src: "/images/profile.jpg", alt: "My dog on a trail" };
    const { container, unmount } = renderIntoDocument(
      <IdentityRail {...BASE_PROPS} galleryPhotos={[photo]} />
    );

    // Real-image branch: an <img> with the gallery alt exists.
    expect(container.querySelector(`img[alt="${photo.alt}"]`)).not.toBeNull();

    unmount();
  });
});
