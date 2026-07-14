/**
 * A photo slot in the `/author` gallery. `src` is optional: a slot without a
 * file yet renders as a labeled placeholder tile until the image lands under
 * `public/images/`.
 */
export interface GalleryPhoto {
  src?: string;
  alt: string;
}

export interface OwnerProfile {
  /**
   * The owner's display name — the single source of the human identity shown
   * on `/author` (FR-6). Kept distinct from `imageAlt`: identity must not leak
   * through an alt-text field, so consumers read `name`, never `imageAlt`.
   */
  name: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  /** Short first-person introduction for the `/author` About section. */
  bio: string;
  /** Secondary photos (pets, outdoors) shown as thumbnails under the portrait. */
  galleryPhotos: GalleryPhoto[];
}

export const ownerProfile: OwnerProfile = {
  name: "Ernest Bednarczyk",
  imageSrc: "/images/profile.jpg",
  imageAlt: "Ernest Bednarczyk",
  title: "SOFTWARE ENGINEER",
  subtitle: "TEAM LEADER",
  bio: "I'm a software engineer and team leader based in Poland. Outside of work you'll usually find me outdoors with my dogs — hiking, trail running, or just getting lost somewhere green. This page is the person behind the code: who I am, how I lead, and how I build.",
  galleryPhotos: [
    { alt: "My dog on a trail" },
    { alt: "Second pet portrait" },
    { alt: "Outdoors / hiking" },
  ],
};
