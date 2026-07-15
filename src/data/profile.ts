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
  /**
   * First-person introduction for the `/author` About section, as an ordered
   * list of paragraphs — each element renders as its own `<p>`.
   */
  bio: readonly string[];
  /** Secondary photos (pets, outdoors) shown as thumbnails under the portrait. */
  galleryPhotos: GalleryPhoto[];
}

export const ownerProfile: OwnerProfile = {
  name: "Ernest Bednarczyk",
  imageSrc: "/images/profile.jpg",
  imageAlt: "Ernest Bednarczyk",
  title: "SOFTWARE ENGINEER",
  subtitle: "TEAM LEADER",
  bio: [
    "Hey! I'm Ernest, and through this blog I'm sharing a small piece of myself with you. I hope it brings some value to your own thinking on the topics discussed here.",
    "A few words about myself. I spent my childhood in a small city in central Poland. Later I bounced around the country, first for my studies and most recently to settle by the Baltic Sea. I graduated in Applied Mathematics, which had been my main interest throughout my school years. After that I wanted to break into the IT world. I started in SQL support roles, moved through various Scala engineering positions, jumped into the Rust ecosystem, and tried my hand at leadership. Quite a lot for my six years of experience! I've had a huge opportunity to challenge my knowledge and skills in both technical and people-related areas. A great experience. And I want more!",
    "Why am I writing this blog? I'm someone who thrives in constantly moving, changing environments. I like the speed :) But it comes at a cost: it's sometimes harder for me to gather my thoughts in a well-organised way. So the blog is my way of practising exactly that.",
    "I also want to see whether my ideas can land on fertile soil and help others on their journeys, mostly in the IT industry but not only.",
    "I hope you'll find something inspiring in this glimpse into my brain. Enjoy!",
  ],
  galleryPhotos: [
    { alt: "My dog on a trail" },
    { alt: "Second pet portrait" },
    { alt: "Outdoors / hiking" },
  ],
};
